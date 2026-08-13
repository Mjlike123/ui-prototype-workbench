import { validateDesignSystem } from "@toptop/design-system-contract/validate";

const result = await validateDesignSystem();

if (!result.valid) {
  console.error(
    `Design system validation failed (${result.errors.length} errors):`,
  );
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Design system contract valid: ${result.checkedFiles} files checked.`,
  );
}
