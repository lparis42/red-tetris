import { useEffect } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
import Form from '../../../../core/components/ui/forms/Form';
import Button from '../../../../core/components/ui/buttons/Button';
import Field from '../../../../core/components/ui/forms/Field';
import Select from '../../../../core/components/ui/forms/Select';
import Input from '../../../../core/components/ui/forms/Input';
import { useGame } from '../../hooks/useGame';

// Component -------------------------------------------------------------------
export default function GameCreateForm()
{
	const { errors, create, validateIdFormat } = useGame();
	const { value, setValue, error, setError } = useInput('', validateIdFormat);

	useEffect(() =>
	{
		setError(errors.create.id);
	}, [ errors.create.id, setError ]);

	const onSubmit = (event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		create(form.get('game_id'), form.get('game_mode'));
	};

	return (
		<Form onSubmit={ onSubmit }>
			<Field label="Game Mode" error={ errors.create.mode }>
				<Select name='game_mode' options={ [ { label: 'Standard' }, { label: 'Easy' }, { label: 'Expert' } ] } />
			</Field>
			<Field label="Game ID ( optional )" error={ error }>
				<Input name='game_id' value={ value } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button type='submit' disabled={ !! error }>Create</Button>
		</Form>
	);
}
