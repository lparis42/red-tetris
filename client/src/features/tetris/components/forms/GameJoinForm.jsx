import { useEffect } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
import { useSubmit } from '../../../../core/hooks/useSubmit';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';
import { useGame } from '../../hooks/useGame';

// Component -------------------------------------------------------------------
export default function GameJoinForm(
	{ initialValue }
)
{
	const { errors, join, validateIdFormat } = useGame();
	const { value, setValue, error, setError } = useInput(initialValue, validateIdFormat);
	const { formRef, submit } = useSubmit();

	useEffect(() =>
	{
		if ( initialValue )
		{
			submit();
		}
	}, [ initialValue, submit ]);

	useEffect(() =>
	{
		setError(errors.join);
	}, [ errors.join, setError ]);

	const onSubmit = (event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		join(form.get('game_id'));
	};

	return (
		<Form onSubmit={ onSubmit } ref={ formRef }>
			<Field label="Game ID" error={ error }>
				<Input type='text' name='game_id' autoComplete='off' value={ value } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button type='submit' disabled={ ! value || !! error }>Join</Button>
		</Form>
	);
}
