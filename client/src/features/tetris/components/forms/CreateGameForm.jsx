import { useCallback, useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { useInput } from '../../../../core/hooks/useInput';
import { validateGameID } from '../../validations/validateGameID';
import Form from '../../../../core/components/ui/forms/Form';
import Button from '../../../../core/components/ui/buttons/Button';
import Field from '../../../../core/components/ui/forms/Field';
import Select from '../../../../core/components/ui/forms/Select';
import Input from '../../../../core/components/ui/forms/Input';

// Component -------------------------------------------------------------------
export default function CreateGameForm()
{
	const socket = useContext(SocketContext);
	const modeInput = useInput('');
	const idInput = useInput('', validateGameID);

	const onSubmit = useCallback((event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:room:create', { mode: form.get('game_mode'), id: form.get('game_id') }, (err, res) =>
		{
			const { errors } = res;

			modeInput.setError(errors?.mode ?? '');
			idInput.setError(errors?.id ?? '');
		});
	}, [ socket, modeInput, idInput ]);

	return (
		<Form onSubmit={ onSubmit }>
			<Field label="Game Mode" error={ modeInput.error }>
				<Select name='game_mode' options={ [ { label: 'Standard' }, { label: 'Expert' } ] } />
			</Field>
			<Field label="Game ID ( optional )" error={ idInput.error }>
				<Input name='game_id' />
			</Field>
			<Button type='submit'>Create</Button>
		</Form>
	);
}
