import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from '../api-client';
import { useAppContext } from "../contexts/AppContext";

const LogoutButton = () => {
    const queryClient = useQueryClient();
    const {showToast} = useAppContext()
    const mutation = useMutation(apiClient.logout, {
        onSuccess: async () => {
            await queryClient.invalidateQueries("validateToken");
            showToast({message: "Logged Out!", type: "SUCCESS"});
        },
        onError: (error) => {
            showToast({message: error.message, type: "ERROR"});
            },
    });

    const handleClick = () => {
        mutation.mutate();
    };
    return (
        <button onClick={handleClick}>Logout</button>
    );
};

export default LogoutButton;