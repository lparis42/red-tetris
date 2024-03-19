import { useEffect, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useInput } from '../../../../core/hooks/useInput';
import { useSubmit } from '../../../../core/hooks/useSubmit';
import { SocketContext } from '../../contexts/SocketContext';
import { validatePlayerName } from '../../validations/validatePlayerName';
import { updatePlayer } from '../../store.slice';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';
import { useUrlState } from '../../hooks/useUrlState';

// Component -------------------------------------------------------------------
export default function RenamePlayerForm(
	{ initialValue }
)
{
	const dispatch = useDispatch();
	const socket = useContext(SocketContext);
	const urlState = useUrlState();
	const { value, setValue, error, setError } = useInput(initialValue, validatePlayerName);
	const { formRef, submit } = useSubmit();

	useEffect(() =>
	{
		if ( initialValue )
		{
			submit();
		}
	}, [ initialValue, submit ]);

	const onSubmit = useCallback((event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:player:rename', { name: form.get('player_name') }, (err, res) =>
		{
			const { error, name } = res;

			if ( error )
			{
				return setError(error);
			}

			urlState.set({ player: name });
			dispatch(updatePlayer({ name }));
		});
	}, [ socket, urlState, dispatch, setError ]);

	return (
		<Form onSubmit={ onSubmit } ref={ formRef }>
			<Field label="Choose your name" error={ error }>
				<Input type='text' name='player_name' autoComplete='off' value={ value } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button type='submit' disabled={ ! value || !! error }>Continue</Button>
		</Form>
	);
}
