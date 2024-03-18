import { useEffect, useCallback, useContext } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
import { SocketContext } from '../../contexts/SocketContext';
import { validateGameID } from '../../validations/validateGameID';
import { useSubmit } from '../../../../core/hooks/useSubmit';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';

// Component -------------------------------------------------------------------
export default function JoinGameForm(
	{ initialValue }
) {
	const socket = useContext(SocketContext);
	const { value, setValue, error, setError } = useInput(initialValue, validateGameID);
	const { formRef, submit } = useSubmit();

	useEffect(() =>
	{
		if ( initialValue )
		{
			submit();
		}
	}, [ initialValue, submit ]);

	const onSubmit = useCallback((event) => {
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:room:join', { id: form.get('game_id') }, (err, res) => {
			const { error } = res;

			setError(error ?? '');
		});
	}, [socket, setError]);

	return (
		<Form onSubmit={onSubmit} ref={formRef}>
			<Field label="Game ID" error={error}>
				<Input type='text' name='game_id' autoComplete='off' value={value} onChange={(e) => setValue(e.target.value)} />
			</Field>
			<Button type='submit' disabled={!value || !!error}>Join</Button>
		</Form>
	);
}
