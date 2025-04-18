import { Socket } from "socket.io";
import { adminFirestore } from "../firebase/admin.sdk";

export const handleNoteSocket = (socket: Socket) => {
socket.on("stream-note", (userId:string, noteId: string) => {
    console.log(`Note Streaming: ${noteId}`);

    const unsubscribe = adminFirestore
        .collection("notes")
        .doc(userId)
        .collection("note")
        .doc(noteId)
        .onSnapshot((docSnapshot) => {
        if (docSnapshot.exists) {
            socket.emit("note-stream", docSnapshot.data());
        } else {
            socket.emit("note-stream", null);
        }
});

    socket.on("disconnect", () => {
    console.log("note socket disconnected");
    unsubscribe();
    });
});
};
