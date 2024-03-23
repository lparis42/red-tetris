import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";
import { usePlayer } from "../../hooks/usePlayer";
import { useGame } from "../../hooks/useGame";

// Component -------------------------------------------------------------------
export default function GameStartForm()
{
	const { player } = usePlayer();
	const { start, isGameLeader } = useGame();

	const onSubmit = (event) =>
	{
		event.preventDefault();

		start();
	}

	return (
		<Form onSubmit={ onSubmit }>
			<Button disabled={ ! isGameLeader(player.name) }>
				{ ( isGameLeader(player.name) ) ? `Start` :  `Waiting leader to start the game...`  }
			</Button>
		</Form>
	);
}
