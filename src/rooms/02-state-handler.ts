import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        console.log("creating player");
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * 10;

        } else if (movement.y) {
            this.players.get(sessionId).y += movement.y * 10;
        }
    }
}

export class StateHandlerRoom extends Room<State> {
    maxClients = 30;

    onCreate (options) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.onMessage("playerUpdate", (client, data) => {
            //console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
            this.broadcast("playerUpdate:"+client.sessionId,[client.sessionId,data], { except: client });
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        console.log("player joined!");
        //client.send("hello", "world");
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
