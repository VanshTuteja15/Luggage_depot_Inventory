import { ShellScreen } from '@/features/app/components/ShellScreen';

export default function LoginScreen() {
  return (
    <ShellScreen
      title="Sign In"
      subtitle="Admin access for Luggage Depot OS"
      phaseLabel="Authentication will be added in a later phase"
      icon="lock-closed-outline"
    />
  );
}
