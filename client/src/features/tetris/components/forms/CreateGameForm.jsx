import { useCallback, useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { useInput } from '../../../../core/hooks/useInput';
import Form from '../../../../core/components/ui/forms/Form';
import Button from '../../../../core/components/ui/buttons/Button';
import Field from '../../../../core/components/ui/forms/Field';
import Select from '../../../../core/components/ui/forms/Select';

// Component -------------------------------------------------------------------
export default function CreateGameForm()
{
	const socket = useContext(SocketContext);
	const { error, setError } = useInput();

	const onSubmit = useCallback((event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:room:create', { mode: form.get('game_mode') }, (res) =>
		{
			const { error } = res ?? {};

			if ( error )
			{
				setError(error);
			}
		});
	}, [ socket, setError ]);

	return (
		<Form onSubmit={ onSubmit }>
			<Field label="Game Mode" error={ error }>
				<Select label="Game Mode" name='game_mode' options={ [ { label: 'Standard' }, { label: 'Expert' } ] } />
			</Field>
			<Button type='submit'>Create</Button>
		</Form>
	);
}
