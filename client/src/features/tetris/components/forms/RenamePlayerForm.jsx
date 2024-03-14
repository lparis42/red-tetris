import { useEffect, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useInput } from '../../../../core/hooks/useInput';
import { SocketContext } from '../../contexts/SocketContext';
import { validatePlayerName } from '../../validations/validatePlayerName';
import { updatePlayer } from '../../store.slice';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';

// Component -------------------------------------------------------------------
export default function RenamePlayerForm(
	{ initialValue }
)
{
	const socket = useContext(SocketContext);
	const dispatch = useDispatch();
	const { value, setValue, error, setError } = useInput(validatePlayerName);

	useEffect(() =>
	{
		if ( initialValue )
		{
			setValue(initialValue);
		}
	}, [ initialValue, setValue ]);

	const onSubmit = useCallback((event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:player:rename', { name: form.get('player_name') }, (err, res) =>
		{
			if ( err )
			{
				return console.log(`SocketIO:Error: `, err);
			}

			const { name, error } = res;

			if ( error )
			{
				return setError(error);
			}

			dispatch(updatePlayer({ name }));
		});
	}, [ socket, dispatch, setError ]);

	return (
		<Form onSubmit={ onSubmit }>
			<Field label="Choose your name" error={ error }>
				<Input type='text' name='player_name' autoComplete='off' value={ value } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button disabled={ ! value || !! error }>Continue</Button>
		</Form>
	);
}
