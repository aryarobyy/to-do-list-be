import { Socket } from "socket.io";
import { adminFirestore } from "../firebase/admin.sdk";

export const handleUserSocket = (socket: Socket) => {
socket.on("stream-user", (userId: string) => {
    console.log(`User streaming: ${userId}`);

    const unsubscribe = adminFirestore
    .collection("user")
    .doc(userId)
    .onSnapshot((docSnapshot) => {
    if (docSnapshot.exists) {
        socket.emit("user-stream", docSnapshot.data());
    }
    });

    socket.on("disconnect", () => {
    console.log("User socket disconnected");
    unsubscribe();
    });
});
};
