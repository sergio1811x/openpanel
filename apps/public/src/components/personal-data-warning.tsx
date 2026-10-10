import { Callout } from 'fumadocs-ui/components/callout';

export function PersonalDataWarning() {
  return (
    <Callout>
      Обратите внимание: это считается персональными данными. Убедитесь, что у
      вас есть согласие пользователя, прежде чем вызывать это!
    </Callout>
  );
}
