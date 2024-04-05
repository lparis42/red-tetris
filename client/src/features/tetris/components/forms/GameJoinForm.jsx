import { useEffect } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
import { useSubmit } from '../../../../core/hooks/useSubmit';
import { useDebounceValue } from '../../../../core/hooks/useDebounceValue';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';
import { useGame } from '../../hooks/useGame';

// Component -------------------------------------------------------------------
export default function GameJoinForm(
	{ initialValue = '' }
)
{
	const { suggestions, errors, list, join, clear, validateIdFormat } = useGame();
	const { value, setValue, error, setError } = useInput(initialValue, validateIdFormat);
	const { formRef, submit } = useSubmit();
	const debouncedValue = useDebounceValue(value, 250);

	useEffect(() =>
	{
		if ( initialValue )
		{
			submit();
		}
	}, [ initialValue, submit ]);

	useEffect(() =>
	{
		if ( debouncedValue && errors.join )
		{
			setError(errors.join);
			clear();
		}
	}, [ debouncedValue, errors.join, setError, clear ]);

	useEffect(() =>
	{
		list(debouncedValue);
	}, [ debouncedValue, list ]);

	const onFocus = (event) =>
	{
		event.preventDefault();

		list(value);
	};

	const onSubmit = (event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		join(form.get('game_id'));
	};

	return (
		<Form onSubmit={ onSubmit } ref={ formRef }>
			<Field label="Game ID" error={ error }>
				<Input type='text' name='game_id' autoComplete='off' suggestions={ suggestions } value={ value } onFocus={ onFocus } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button type='submit' disabled={ ! value || !! error }>Join</Button>
		</Form>
	);
}
