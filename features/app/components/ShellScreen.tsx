import { EmptyState, Header, ScreenContainer } from '@/components/ui';
import type { ComponentProps } from 'react';

type ShellScreenProps = {
  title: string;
  subtitle: string;
  phaseLabel: string;
  icon?: ComponentProps<typeof EmptyState>['icon'];
};

export function ShellScreen({ title, subtitle, phaseLabel, icon = 'construct-outline' }: ShellScreenProps) {
  return (
    <ScreenContainer>
      <Header title={title} subtitle={subtitle} />
      <EmptyState
        title={`${title} coming soon`}
        description={`${phaseLabel}. The navigation shell and shared components are ready.`}
        icon={icon}
      />
    </ScreenContainer>
  );
}
