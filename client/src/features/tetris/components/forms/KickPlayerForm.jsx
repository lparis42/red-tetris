import { useCallback, useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";

// Component -------------------------------------------------------------------
export default function KickPlayerForm(
	{ player }
) {
	const { name } = player;

	const socket = useContext(SocketContext);

	const onSubmit = useCallback((event) => {
		event.preventDefault();
		socket.emit('tetris:room:kick', { name }, (err, res) => {
			if (err) {
				return console.log(`SocketIO:Error: `, err);
			}
			const { error } = res;
			if (error) {
				return console.log(error);
			}
		});
	}, [socket, name]);


	return (
		<Form onSubmit={onSubmit}>
			<Button size='small'><span className={`red`}>Kick</span></Button>
		</Form>
	);
}
