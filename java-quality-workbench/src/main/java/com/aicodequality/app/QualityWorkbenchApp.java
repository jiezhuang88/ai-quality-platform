package com.aicodequality.app;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

public class QualityWorkbenchApp {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (ReflectiveOperationException | javax.swing.UnsupportedLookAndFeelException ignored) {
                // The default look and feel is acceptable when the system look and feel is unavailable.
            }
            new QualityWorkbenchFrame().setVisible(true);
        });
    }
}
