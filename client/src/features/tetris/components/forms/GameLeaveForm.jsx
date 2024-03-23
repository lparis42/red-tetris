import Form from "../../../../core/components/ui/forms/Form";
import Button from "../../../../core/components/ui/buttons/Button";
import { useGame } from "../../hooks/useGame";
import { UrlUtils } from '../../utilities/UrlUtils';

// Component -------------------------------------------------------------------
export default function LeaveGameForm()
{
	const { leave } = useGame();

	const onSubmit = (event) =>
	{
		event.preventDefault();

		leave();

		UrlUtils.set({ game: '' });
	};

	return (
		<Form onSubmit={ onSubmit }>
			<Button>Leave</Button>
		</Form>
	);
}
