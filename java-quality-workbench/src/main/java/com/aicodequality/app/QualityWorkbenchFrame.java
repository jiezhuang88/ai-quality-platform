package com.aicodequality.app;

import com.aicodequality.model.GateStatus;
import com.aicodequality.model.QualityCase;
import com.aicodequality.model.RiskAssessment;
import com.aicodequality.model.RiskLevel;
import com.aicodequality.model.TestPlan;
import com.aicodequality.service.ReportGenerator;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class QualityWorkbenchFrame extends JFrame {
    private final QualityCase qualityCase = new QualityCase();
    private final ReportGenerator reportGenerator = new ReportGenerator();

    private final JTextField titleField = new JTextField();
    private final JTextArea goalArea = area(4);
    private final JTextArea aiUsageArea = area(4);
    private final JTextArea acceptanceArea = area(5);
    private final JTextArea rollbackArea = area(4);
    private final JTextArea residualRiskArea = area(4);

    private final JComboBox<Integer> userImpactScore = scoreBox();
    private final JComboBox<Integer> dataImpactScore = scoreBox();
    private final JComboBox<Integer> complexityScore = scoreBox();
    private final JComboBox<Integer> reversibilityScore = scoreBox();
    private final JComboBox<Integer> confidenceScore = scoreBox();
    private final JLabel riskSummary = new JLabel("Risk: Low (5/25)", SwingConstants.LEFT);

    private final JTextArea unitTestsArea = area(4);
    private final JTextArea integrationTestsArea = area(4);
    private final JTextArea e2eTestsArea = area(4);
    private final JTextArea securityTestsArea = area(4);
    private final JTextArea performanceTestsArea = area(4);
    private final JTextArea manualChecksArea = area(4);

    private final JCheckBox unitPass = new JCheckBox("Unit tests pass");
    private final JCheckBox integrationPass = new JCheckBox("Integration tests pass");
    private final JCheckBox staticPass = new JCheckBox("Static analysis pass");
    private final JCheckBox secretPass = new JCheckBox("Secret scan pass");
    private final JCheckBox securityReview = new JCheckBox("Security review done");
    private final JCheckBox rollbackReady = new JCheckBox("Rollback plan ready");
    private final JCheckBox humanReview = new JCheckBox("Human review done");
    private final JLabel gateSummary = new JLabel("Gate: Not ready", SwingConstants.LEFT);

    private final JTextArea reportArea = area(24);

    public QualityWorkbenchFrame() {
        super("AI Code Quality Workbench");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(980, 720));
        setLocationByPlatform(true);
        setLayout(new BorderLayout());

        add(header(), BorderLayout.NORTH);
        add(tabs(), BorderLayout.CENTER);
        add(actions(), BorderLayout.SOUTH);

        refreshRiskSummary();
        refreshGateSummary();
        refreshReport();
    }

    private JPanel header() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(new EmptyBorder(16, 20, 12, 20));

        JLabel title = new JLabel("AI Code Quality Workbench");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 22f));

        JLabel subtitle = new JLabel("Change -> Risk -> Tests -> Gate -> Report");
        subtitle.setForeground(new Color(80, 80, 80));

        panel.add(title, BorderLayout.NORTH);
        panel.add(subtitle, BorderLayout.SOUTH);
        return panel;
    }

    private JTabbedPane tabs() {
        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("1. Change", changePanel());
        tabs.addTab("2. Risk", riskPanel());
        tabs.addTab("3. Tests", testsPanel());
        tabs.addTab("4. Gate", gatePanel());
        tabs.addTab("5. Report", reportPanel());
        return tabs;
    }

    private JPanel changePanel() {
        JPanel panel = formPanel();
        addRow(panel, 0, "Change title", titleField);
        addRow(panel, 1, "Business goal", scroll(goalArea));
        addRow(panel, 2, "AI assistance", scroll(aiUsageArea));
        addRow(panel, 3, "Acceptance criteria", scroll(acceptanceArea));
        addRow(panel, 4, "Rollback plan", scroll(rollbackArea));
        addRow(panel, 5, "Residual risk", scroll(residualRiskArea));
        return wrap(panel);
    }

    private JPanel riskPanel() {
        JPanel panel = formPanel();
        addRow(panel, 0, "User impact", userImpactScore);
        addRow(panel, 1, "Data impact", dataImpactScore);
        addRow(panel, 2, "Complexity", complexityScore);
        addRow(panel, 3, "Reversibility", reversibilityScore);
        addRow(panel, 4, "Confidence gap", confidenceScore);

        JPanel summaryPanel = new JPanel(new BorderLayout());
        summaryPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(210, 210, 210)),
                new EmptyBorder(14, 14, 14, 14)
        ));
        riskSummary.setFont(riskSummary.getFont().deriveFont(Font.BOLD, 18f));
        summaryPanel.add(riskSummary, BorderLayout.CENTER);
        addRow(panel, 5, "Result", summaryPanel);

        userImpactScore.addActionListener(event -> refreshRiskSummary());
        dataImpactScore.addActionListener(event -> refreshRiskSummary());
        complexityScore.addActionListener(event -> refreshRiskSummary());
        reversibilityScore.addActionListener(event -> refreshRiskSummary());
        confidenceScore.addActionListener(event -> refreshRiskSummary());
        return wrap(panel);
    }

    private JPanel testsPanel() {
        JPanel panel = formPanel();
        addRow(panel, 0, "Unit tests", scroll(unitTestsArea));
        addRow(panel, 1, "Integration tests", scroll(integrationTestsArea));
        addRow(panel, 2, "E2E tests", scroll(e2eTestsArea));
        addRow(panel, 3, "Security tests", scroll(securityTestsArea));
        addRow(panel, 4, "Performance tests", scroll(performanceTestsArea));
        addRow(panel, 5, "Manual checks", scroll(manualChecksArea));
        return wrap(panel);
    }

    private JPanel gatePanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));

        JPanel checks = new JPanel(new GridBagLayout());
        checks.setBorder(BorderFactory.createTitledBorder("Quality Gate Evidence"));

        JCheckBox[] boxes = {unitPass, integrationPass, staticPass, secretPass, securityReview, rollbackReady, humanReview};
        for (int i = 0; i < boxes.length; i++) {
            GridBagConstraints constraints = new GridBagConstraints();
            constraints.gridx = 0;
            constraints.gridy = i;
            constraints.weightx = 1;
            constraints.fill = GridBagConstraints.HORIZONTAL;
            constraints.insets = new Insets(6, 10, 6, 10);
            checks.add(boxes[i], constraints);
            boxes[i].addActionListener(event -> refreshGateSummary());
        }

        gateSummary.setBorder(new EmptyBorder(12, 12, 12, 12));
        gateSummary.setFont(gateSummary.getFont().deriveFont(Font.BOLD, 18f));
        gateSummary.setOpaque(true);

        panel.add(checks, BorderLayout.CENTER);
        panel.add(gateSummary, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel reportPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        reportArea.setEditable(false);
        panel.add(scroll(reportArea), BorderLayout.CENTER);
        return panel;
    }

    private JPanel actions() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        panel.setBorder(new EmptyBorder(8, 16, 14, 16));

        JButton refresh = new JButton("Refresh Report");
        refresh.addActionListener(event -> refreshReport());

        JButton export = new JButton("Export Markdown");
        export.addActionListener(event -> exportReport());

        panel.add(refresh);
        panel.add(export);
        return panel;
    }

    private void syncModel() {
        qualityCase.setTitle(titleField.getText());
        qualityCase.setBusinessGoal(goalArea.getText());
        qualityCase.setAiUsage(aiUsageArea.getText());
        qualityCase.setAcceptanceCriteria(acceptanceArea.getText());
        qualityCase.setRollbackPlan(rollbackArea.getText());
        qualityCase.setResidualRisk(residualRiskArea.getText());

        RiskAssessment risk = qualityCase.riskAssessment();
        risk.setUserImpact(selectedScore(userImpactScore));
        risk.setDataImpact(selectedScore(dataImpactScore));
        risk.setComplexity(selectedScore(complexityScore));
        risk.setReversibility(selectedScore(reversibilityScore));
        risk.setConfidence(selectedScore(confidenceScore));

        TestPlan tests = qualityCase.testPlan();
        tests.setUnitTests(unitTestsArea.getText());
        tests.setIntegrationTests(integrationTestsArea.getText());
        tests.setE2eTests(e2eTestsArea.getText());
        tests.setSecurityTests(securityTestsArea.getText());
        tests.setPerformanceTests(performanceTestsArea.getText());
        tests.setManualChecks(manualChecksArea.getText());

        GateStatus gate = qualityCase.gateStatus();
        gate.setUnitTestsPass(unitPass.isSelected());
        gate.setIntegrationTestsPass(integrationPass.isSelected());
        gate.setStaticAnalysisPass(staticPass.isSelected());
        gate.setSecretScanPass(secretPass.isSelected());
        gate.setSecurityReviewDone(securityReview.isSelected());
        gate.setRollbackPlanReady(rollbackReady.isSelected());
        gate.setHumanReviewDone(humanReview.isSelected());
    }

    private void refreshRiskSummary() {
        syncModel();
        RiskAssessment risk = qualityCase.riskAssessment();
        RiskLevel level = risk.level();
        riskSummary.setText("Risk: " + level.label() + " (" + risk.totalScore() + "/25)");
        refreshGateSummary();
    }

    private void refreshGateSummary() {
        syncModel();
        RiskLevel level = qualityCase.riskAssessment().level();
        boolean ready = qualityCase.gateStatus().readyToMerge(level);
        gateSummary.setText("Gate: " + (ready ? "Ready to merge" : "Not ready") + " | Passed "
                + qualityCase.gateStatus().passedCount() + "/7 | Risk " + level.label());
        gateSummary.setBackground(ready ? new Color(222, 245, 229) : new Color(255, 236, 214));
        refreshReport();
    }

    private void refreshReport() {
        syncModel();
        reportArea.setText(reportGenerator.generate(qualityCase));
        reportArea.setCaretPosition(0);
    }

    private void exportReport() {
        refreshReport();
        Path output = Path.of("reports", "ai-quality-report.md");
        try {
            Files.createDirectories(output.getParent());
            Files.writeString(output, reportArea.getText(), StandardCharsets.UTF_8);
            JOptionPane.showMessageDialog(this, "Report exported to " + output.toAbsolutePath());
        } catch (IOException exception) {
            JOptionPane.showMessageDialog(this, "Export failed: " + exception.getMessage(), "Export Failed", JOptionPane.ERROR_MESSAGE);
        }
    }

    private JPanel formPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        return panel;
    }

    private JPanel wrap(JPanel content) {
        JPanel panel = new JPanel(new BorderLayout());
        panel.add(content, BorderLayout.NORTH);
        return panel;
    }

    private void addRow(JPanel panel, int row, String label, java.awt.Component component) {
        GridBagConstraints labelConstraints = new GridBagConstraints();
        labelConstraints.gridx = 0;
        labelConstraints.gridy = row;
        labelConstraints.anchor = GridBagConstraints.NORTHWEST;
        labelConstraints.insets = new Insets(8, 0, 8, 14);
        JLabel fieldLabel = new JLabel(label);
        fieldLabel.setPreferredSize(new Dimension(150, 28));
        panel.add(fieldLabel, labelConstraints);

        GridBagConstraints fieldConstraints = new GridBagConstraints();
        fieldConstraints.gridx = 1;
        fieldConstraints.gridy = row;
        fieldConstraints.weightx = 1;
        fieldConstraints.fill = GridBagConstraints.HORIZONTAL;
        fieldConstraints.insets = new Insets(8, 0, 8, 0);
        panel.add(component, fieldConstraints);
    }

    private JScrollPane scroll(JTextArea area) {
        JScrollPane scrollPane = new JScrollPane(area);
        scrollPane.setPreferredSize(new Dimension(680, Math.max(92, area.getRows() * 24)));
        return scrollPane;
    }

    private static JTextArea area(int rows) {
        JTextArea area = new JTextArea(rows, 32);
        area.setLineWrap(true);
        area.setWrapStyleWord(true);
        return area;
    }

    private static JComboBox<Integer> scoreBox() {
        return new JComboBox<>(new Integer[]{1, 2, 3, 4, 5});
    }

    private int selectedScore(JComboBox<Integer> box) {
        Integer value = (Integer) box.getSelectedItem();
        return value == null ? 1 : value;
    }
}
