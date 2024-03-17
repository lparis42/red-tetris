import { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";

// Component -------------------------------------------------------------------
export default function StartGameForm(
	{ isGameLeader }
)
{
	const socket = useContext(SocketContext);

	const onSubmit = (event) =>
	{
		event.preventDefault();

		socket.emit('tetris:game:start', (res) =>
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
			<Button disabled={ ! isGameLeader }>
				{ ( isGameLeader ) ? `Start` :  `Waiting leader to start the game...`  }
			</Button>
		</Form>
	);
}
