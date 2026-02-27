import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, Image } from "@react-pdf/renderer";
import { getInterpretationBand, getProfileType } from "./utils"; 

// Register standard fonts
Font.register({
  family: "Helvetica-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/pdfkit/0.13.0/data/Helvetica-Bold.afm",
});

// Premium Black & Gold Palette
const colors = {
  bg: "#09090b",          
  cardBg: "#18181b",      
  border: "#27272a",      
  textPrimary: "#ffffff", 
  textSecondary: "#d4d4d8", 
  textMuted: "#a1a1aa",   
  gold: "#fbbf24",        
  goldDim: "#f59e0b",     
};

// --- SVG ICON COMPONENT ---
const iconPaths = {
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  compass: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  brain: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"
};

const PdfIcon = ({ icon, color = "#000000", size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={iconPaths[icon]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// --- ENGINE METADATA ---
const ENGINE_META = {
  grit: { title: "Follow-Through", desc: "Ability to stick with tasks and long-term goals.", color: "#f97316", icon: "target" },
  selfControl: { title: "Impulse Control", desc: "Ability to say no to temptations and maintain standards.", color: "#f59e0b", icon: "zap" },
  planning: { title: "Direction & Structure", desc: "Ability to plan ahead and link actions to future goals.", color: "#06b6d4", icon: "compass" },
  adaptability: { title: "Adaptability & Learning", desc: "Ability to handle feedback and adjust course.", color: "#10b981", icon: "brain" },
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", flexDirection: "column", backgroundColor: colors.bg },
  header: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 15, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", color: colors.textPrimary },
  subtitle: { fontSize: 10, color: colors.gold, marginTop: 4 }, 
  scoreBox: { alignItems: "flex-end" },
  scoreText: { fontSize: 32, fontFamily: "Helvetica-Bold", color: colors.textPrimary },
  
  // Profile Section
  profileBox: { backgroundColor: colors.cardBg, padding: 15, borderRadius: 6, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.textMuted, textTransform: "uppercase", marginBottom: 6 },
  profileName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: colors.gold, marginBottom: 4 },
  profileDesc: { fontSize: 10, color: colors.textSecondary, lineHeight: 1.4 },

  // --- UPDATED ENGINE CARDS ---
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  engineCard: { 
    width: "48%", 
    backgroundColor: colors.cardBg, 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12, 
    flexDirection: "row", 
    alignItems: "flex-start",
    gap: 10
  },
  engineIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0
  },
  engineContent: { flex: 1 },
  engineHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  engineName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: colors.textPrimary },
  engineScore: { fontSize: 12, fontFamily: "Helvetica-Bold", color: colors.gold },
  engineDesc: { fontSize: 8, color: colors.textMuted, lineHeight: 1.3 },
  
  // Raw Data
  dataGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 20 },
  dataCell: { width: "18%", backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, padding: 8, borderRadius: 4, alignItems: "center" },
  dataLabel: { fontSize: 7, color: colors.textMuted, marginBottom: 2 },
  dataVal: { fontSize: 12, fontFamily: "Helvetica-Bold", color: colors.textPrimary },

  // AI Analysis (Document Flow)
  docPage: { padding: 50, fontFamily: "Helvetica", backgroundColor: colors.bg },
  aiHeader: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 20 },
  h3: { fontSize: 14, fontFamily: "Helvetica-Bold", color: colors.gold, marginTop: 15, marginBottom: 8 },
  p: { fontSize: 11, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 10 },
  listItem: { fontSize: 11, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 4, paddingLeft: 10 },
  bold: { fontFamily: "Helvetica-Bold", color: colors.textPrimary },
  link: { color: colors.goldDim, textDecoration: "underline" },

  // ... existing styles ...

  // Footer / CTA Section
  footer: { 
    marginTop: 40, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 15 
  },
  footerLogo: { 
    width: 90,        // Doubled the width to match the 2:1 ratio
    height: 45,       // Kept height at 45
    objectFit: "contain" // Ensures the logo never stretches or distorts
  },
  footerTextContainer: { 
    flex: 1,
    gap: 4            // Added a tiny gap between paragraphs for readability
  },
  footerTitle: { 
    fontSize: 12, 
    fontFamily: "Helvetica-Bold", 
    color: colors.gold, 
    marginBottom: 2 
  },
  footerText: { 
    fontSize: 9,      // Slightly scaled down to fit the extra text elegantly
    color: colors.textSecondary, 
    lineHeight: 1.4 
  },
  footerLink: { 
    color: colors.goldDim, 
    fontFamily: "Helvetica-Bold",
    textDecoration: "none"
  }
});

const parseMarkdownLine = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={index} style={styles.bold}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      return match ? <Text key={index} style={styles.link}>{match[1]}</Text> : part;
    }
    return part;
  });
};

const RenderAIReport = ({ text }) => {
  if (!text) return <Text style={styles.p}>No AI Strategy Report generated yet.</Text>;
  
  const blocks = text.split('\n\n');
  return blocks.map((block, i) => {
    if (block.startsWith('### ')) {
      return <Text key={i} style={styles.h3}>{block.replace('### ', '')}</Text>;
    }
    if (block.startsWith('- ') || block.startsWith('* ') || /^\d+\./.test(block)) {
      const items = block.split('\n').filter(l => l.trim().length > 0);
      return (
        <View key={i} style={{ marginBottom: 10 }}>
          {items.map((item, j) => (
            <Text key={j} style={styles.listItem}>
              • {parseMarkdownLine(item.replace(/^[-*]\s|^\d+\.\s/, ''))}
            </Text>
          ))}
        </View>
      );
    }
    return <Text key={i} style={styles.p}>{parseMarkdownLine(block)}</Text>;
  });
};

export default function AssessmentPdfReport({ submission }) {
  const profile = getProfileType(submission.results);
  const band = getInterpretationBand(submission.results.overall);

  return (
    <Document>
      {/* PAGE 1: EXECUTIVE SUMMARY & DATA */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Performance Analysis</Text>
            <Text style={styles.subtitle}>{submission.email}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{submission.results.overall}%</Text>
            <Text style={[styles.subtitle, { textTransform: "uppercase" }]}>{band.label}</Text>
          </View>
        </View>

        <View style={styles.profileBox}>
          <Text style={styles.sectionTitle}>Primary Archetype</Text>
          <Text style={styles.profileName}>{profile.title}</Text>
          <Text style={styles.profileDesc}>{profile.desc}</Text>
        </View>

        <Text style={styles.sectionTitle}>Engine Breakdown</Text>
        <View style={styles.grid}>
          {Object.entries(submission.results).map(([key, val]) => {
            if (key === 'overall' || !ENGINE_META[key]) return null;
            const meta = ENGINE_META[key];
            
            return (
              <View key={key} style={styles.engineCard}>
                {/* Colored Icon Box */}
                <View style={[styles.engineIconBox, { backgroundColor: meta.color }]}>
                  <PdfIcon icon={meta.icon} color="#000000" size={14} />
                </View>
                
                {/* Text Content */}
                <View style={styles.engineContent}>
                  <View style={styles.engineHeaderRow}>
                    <Text style={styles.engineName}>{meta.title}</Text>
                    <Text style={styles.engineScore}>{val}%</Text>
                  </View>
                  <Text style={styles.engineDesc}>{meta.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Raw Assessment Data</Text>
        <View style={styles.dataGrid}>
          {submission.answers.map((val, idx) => (
            <View key={idx} style={styles.dataCell}>
              <Text style={styles.dataLabel}>Q{idx + 1}</Text>
              <Text style={styles.dataVal}>{val}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* PAGE 2+: AI INSIGHTS */}
      <Page size="A4" style={styles.docPage}>
        <Text style={styles.aiHeader}>Research Analysis</Text>
        <RenderAIReport text={submission.aiInsights} />

        {/* --- BRANDING & CALL TO ACTION FOOTER --- */}
        <View style={styles.footer} wrap={false}>
          <Image src="https://success.martialpeter.com/logo.png" style={styles.footerLogo} />
          
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerTitle}>Success Potential Assessment</Text>
            
            <Text style={styles.footerText}>
              This executive analysis was generated by the Success Potential app by Martial Peter. 
              {/* The insights and evaluations within this report are strictly backed by peer-reviewed psychological frameworks and research from Harvard Business School, MIT Sloan, and Stanford GSB. */}
            </Text>
            
            <Text style={styles.footerText}>
              Want to map your own performance engines and uncover your unique psychological profile? 
            </Text>
            <Text style={styles.footerText}>
              Visit <Text style={styles.footerLink}>success.martialpeter.com</Text>.
            </Text>
          </View>
        </View>
        
      </Page>
    </Document>
  );
}