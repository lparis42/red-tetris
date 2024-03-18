import { useCallback, useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";

// Component -------------------------------------------------------------------
export default function LeaveGameForm()
{
	const socket = useContext(SocketContext);

	const onSubmit = useCallback((event) => {
		event.preventDefault();
		socket.emit('tetris:room:leave', (err, res) => {
			if (err) {
				return console.log(`SocketIO:Error: `, err);
			}
			const { error } = res;
			if (error) {
				// ...
			}
		});
	}, [socket]);

	return (
		<Form onSubmit={ onSubmit }>
			<Button>Leave</Button>
		</Form>
	);
}
