import { useState, useEffect, useCallback, useContext } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
//import { useDebounce } from '../../../../core/hooks/useDebounce';
import { SocketContext } from '../../contexts/SocketContext';
import { validateGameID } from '../../validations/validateGameID';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';

// Component -------------------------------------------------------------------
export default function JoinGameForm(
	{ initialValue }
) {
	const socket = useContext(SocketContext);
	const { value, setValue, error, setError } = useInput(validateGameID);
	const [suggestions, setSuggestions] = useState([]);
	//const debouncedValue = useDebounce(value, 250);

	useEffect(() => {
		if (initialValue) {
			setValue(initialValue);
		}
	}, [initialValue, setValue]);

	const updateSuggestions = useCallback(() => {
		socket.emit('tetris:room:list', /*{ id: debouncedValue },*/ (err, res) => {
			if (err) {
				return console.log(`SocketIO:Error: `, err);
			}

			// if ( ! debouncedValue )
			// {
			// 	return setError('');
			// }

			const list = res;

			if ( ! list?.length )
			{
				return setError(`Room not found`);
			}

			setSuggestions(list.map((({ id, mode }) => ({ value: id, label: `[${mode}] ${id} ` }))));
		});
	}, [socket, /*debouncedValue,*/ setSuggestions, setError]);

	useEffect(() => {
		updateSuggestions();
	}, [/*debouncedValue,*/ updateSuggestions]);

	const onSubmit = useCallback((event) => {
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		socket.emit('tetris:room:join', { id: form.get('game_id') }, (err, res) => {
			if (err) {
				return console.log(`SocketIO:Error: `, err);
			}

			const { error } = res;

			if (error) {
				setError(error);
			}
		});
	}, [socket, setError]);

	return (
		<Form onSubmit={onSubmit}>
			<Field label="Game ID" error={error}>
				<Input type='text' name='game_id' autoComplete='off' value={value} suggestions={suggestions} onChange={(e) => setValue(e.target.value)} />
			</Field>
			<Button disabled={!!error || !value} type='submit'>Join</Button>
		</Form>
	);
}
