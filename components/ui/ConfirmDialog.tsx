import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, shadows, spacing, touchTarget } from '@/constants/theme';

import { Button } from './Button';
import { Text } from './Text';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
        style={styles.overlay}
        onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View accessibilityRole="alert">
            <Text variant="h3" style={styles.title}>
              {title}
            </Text>
            <Text variant="body" color={colors.textSecondary}>
              {message}
            </Text>
            <View style={styles.actions}>
              <Button
                label={cancelLabel}
                variant="outline"
                onPress={onCancel}
                disabled={loading}
                style={styles.actionButton}
              />
              <Button
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
                loading={loading}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 120,
    minHeight: touchTarget,
  },
});
