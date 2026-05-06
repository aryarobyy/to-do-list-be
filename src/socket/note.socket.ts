import { Socket } from "socket.io";
import { adminFirestore } from "../firebase/admin.sdk";
import { NOTES_COLLECTION, SUBTASK_COLLECTION } from "../core/constants";

export const handleNoteSocket = (socket: Socket) => {
socket.on("stream-note", (userId:string, noteId: string) => {
    console.log(`Note Streaming: ${noteId}`);

    const unsubscribe = adminFirestore
        .collection(NOTES_COLLECTION)
        .doc(userId)
        .collection(SUBTASK_COLLECTION)
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
