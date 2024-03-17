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

		socket.emit('tetris:room:leave', (res) =>
		{
			const { id, error } = res ?? {};

			if ( error )
			{
				return ; // Todo: Toast ?
			}

			dispatch(leaveGame({ id }));
		});
	}

	return (
		<Form onSubmit={ onSubmit }>
			<Button>Leave</Button>
		</Form>
	);
}
