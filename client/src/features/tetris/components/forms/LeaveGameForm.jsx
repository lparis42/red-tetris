import { useContext } from "react";
import { useDispatch } from "react-redux";
import { SocketContext } from "../../contexts/SocketContext";
import { leaveGame } from "../../store.slice";
import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";

// Component -------------------------------------------------------------------
export default function LeaveGameForm()
{
	const socket = useContext(SocketContext);
	const dispatch = useDispatch();

	const onSubmit = (event) =>
	{
		event.preventDefault();

		socket.emit('tetris:room:leave', (err, res) =>
		{
			if ( err )
			{
				return console.log(`SocketIO:Error: `, err);
			}

			const { error } = res;

			if ( ! error )
			{
				dispatch(leaveGame());
			}
		});
	}

	return (
		<Form onSubmit={ onSubmit }>
			<Button>Leave</Button>
		</Form>
	);
}
