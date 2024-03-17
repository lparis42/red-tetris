import { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";

// Component -------------------------------------------------------------------
export default function KickPlayerForm(
	{ player }
)
{
	const socket = useContext(SocketContext);

	const onSubmit = (event) =>
	{
		event.preventDefault();

		socket.emit('tetris:room:kick', { name: player.name }, (res) =>
		{
			const { error } = res ?? {};

			if ( error )
			{
				return ; // Todo: Toast ?
			}
		});
	}

	return (
		<Form onSubmit={ onSubmit }>
			<Button size='small'><span className={ `red` }>Kick</span></Button>
		</Form>
	);
}
