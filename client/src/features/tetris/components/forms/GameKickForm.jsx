import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";
import { useGame } from "../../hooks/useGame";

// Component -------------------------------------------------------------------
export default function GameKickForm(
	{ player }
)
{
	const { kick } = useGame();

	const onSubmit = (event) =>
	{
		event.preventDefault();

		kick(player.name);
	};

	return (
		<Form onSubmit={ onSubmit }>
			<Button size='small' className={ `text-red` }>Kick</Button>
		</Form>
	);
}
