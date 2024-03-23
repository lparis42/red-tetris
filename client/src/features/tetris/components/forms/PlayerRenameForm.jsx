import { useCallback, useEffect } from 'react';
import { useInput } from '../../../../core/hooks/useInput';
import { useSubmit } from '../../../../core/hooks/useSubmit';
import Form from '../../../../core/components/ui/forms/Form';
import Field from '../../../../core/components/ui/forms/Field';
import Input from '../../../../core/components/ui/forms/Input';
import Button from '../../../../core/components/ui/buttons/Button';
import { usePlayer } from '../../hooks/usePlayer';

// Component -------------------------------------------------------------------
export default function PlayerRenameForm(
	{ initialValue }
)
{
	const { errors, rename, validateNameFormat } = usePlayer();
	const { value, setValue, error, setError } = useInput(initialValue, validateNameFormat);
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
		setError(errors.rename);
	}, [ errors.rename, setError ]);

	const onSubmit = useCallback((event) =>
	{
		event.preventDefault();

		const form = new FormData(event.currentTarget);

		rename(form.get('player_name'));
	}, [ rename ]);

	return (
		<Form onSubmit={ onSubmit } ref={ formRef }>
			<Field label="Choose your name" error={ error }>
				<Input type='text' name='player_name' autoComplete='off' value={ value } onChange={ (e) => setValue(e.target.value) } />
			</Field>
			<Button type='submit' disabled={ ! value || !! error }>Continue</Button>
		</Form>
	);
}
