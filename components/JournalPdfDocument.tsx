// components/JournalPdfDocument.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { IJournalData, IFeelingsEntry, IGoalEntry } from "@/app/page";

// --- Color Palette from Screenshots ---
const colors = {
  darkTeal: "#0d2c3e",
  midTeal: "#11aab1",
  darkPurple: "#2e2e54",
  gold: "#d4ac0d",
  lightPink: "#fdeef0",
  white: "#FFFFFF",
  black: "#0c2b3e",
  lightGrayText: "#555555",
  tableBorder: "#e0e0e0",
  lightGrayBg: "#f7f7f7", // For empty content cells
};

// --- Register Fonts ---
Font.register({
  family: "Helvetica-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/pdfkit/0.13.0/data/Helvetica-Bold.afm",
  fontStyle: "normal",
  fontWeight: "bold",
});

// --- PDF Stylesheet ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.black,
  },
  
  // --- Page 1: Feelings ---
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthYearContainer: {
    // --- FIXED ---
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.tableBorder,
  },
  monthYearRow: {
    flexDirection: "row",
    // --- FIXED ---
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.tableBorder,
  },
  monthYearLabel: {
    width: 60,
    padding: 6,
    backgroundColor: colors.darkTeal,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
  },
  monthYearValue: {
    width: 200,
    padding: 6,
    backgroundColor: colors.white,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.darkTeal,
  },

  // Feelings Table
  feelingsTable: {
    // --- FIXED ---
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.tableBorder,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.darkTeal,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    // --- FIXED ---
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.tableBorder,
  },
  colArea: {
    width: "20%",
    padding: 8,
    justifyContent: "center",
  },
  colFeelings: {
    width: "25%",
    padding: 8,
    // --- FIXED ---
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.tableBorder,
    backgroundColor: colors.lightGrayBg,
    color: "black"
  },
  colSituation: {
    width: "25%",
    padding: 8,
    // --- FIXED ---
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.tableBorder,
    backgroundColor: colors.lightGrayBg,
  },
  colSignificance: {
    width: "30%",
    padding: 8,
    // --- FIXED ---
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.tableBorder,
    backgroundColor: colors.lightGrayBg,
  },
  headerText: {
    fontSize: 8,
    color: "#a0b8c6",
    fontWeight: "normal",
  },
  
  // --- Page 2: Goals ---
  goalsTable: {
    // --- FIXED ---
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.tableBorder,
    marginBottom: 20,
  },
  goalsHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.darkTeal,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  colGoalsLabel: {
    width: "25%",
    padding: 8,
  },
  colGoalNum: {
    width: "25%",
    padding: 8,
    // --- FIXED ---
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: "#0f364d", // Darker border for header
  },
  colGoalContent: {
    width: "25%",
    padding: 8,
    // --- FIXED ---
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.tableBorder,
    minHeight: 50, // Give space for content
  },
  colDetailsHeader: {
    width: "25%",
    padding: 8,
    backgroundColor: colors.darkTeal,
    color: colors.white,
    fontFamily: "Helvetica-Bold",
  },
  detailsSubtext: {
    fontSize: 8,
    fontWeight: "normal",
    marginTop: 2,
  },
  hitMissSubtext: {
    fontSize: 8,
    fontWeight: "normal",
    color: colors.lightGrayText,
    marginTop: 2,
  },
});

// --- Helper Functions to Get Data ---
const getFeelingData = (data: IJournalData, key: keyof IJournalData["feelings"]) => {
  return data.feelings[key] || { feelings: "", situation: "", significance: "" };
};

const getGoalData = (
  goals: [IGoalEntry, IGoalEntry, IGoalEntry],
  index: number
) => {
  return goals[index] || { details: "", lastMonth: "N/A", nextMonth: "" };
};

// --- The PDF Document Component ---
export default function JournalPdfDocument({ data, userName }: Props) {
  const [month, year] = data.month.split(" ");

  return (
    <Document>
      {/* --- PAGE 1: Feelings --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* Month/Year Block */}
          <View style={styles.monthYearContainer}>
            <View style={[styles.monthYearRow]}>
              <Text style={styles.monthYearLabel}>Name</Text>
              <Text style={styles.monthYearValue}>{userName || ""}</Text>
            </View>
            <View style={styles.monthYearRow}>
              <Text style={styles.monthYearLabel}>Month</Text>
              <Text style={styles.monthYearValue}>{month || ""}</Text>
            </View>
            <View style={[styles.monthYearRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.monthYearLabel}>Year</Text>
              <Text style={styles.monthYearValue}>{year || ""}</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>MONTHLY UPDATE</Text>
        </View>

        {/* Feelings Table */}
        <View style={styles.feelingsTable}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colArea, { padding: 8 }]}>Area of Life</Text>
            <Text style={{...styles.colFeelings, color: 'black' }}>
              { 'Strongest' }{"\n"}
              <Text style={styles.headerText}>{'What are the strongest feelings this month?'}</Text>
            </Text>
            <Text style={{...styles.colSituation, color: 'black' }}>
              {'Situation'}{"\n"}
              <Text style={styles.headerText}>{'What caused these feelings? '}</Text>
            </Text>
            <Text style={{...styles.colSignificance, color: 'black' }}>
              {'Significance'}{"\n"}
              <Text style={styles.headerText}>{'How was this personally significant to you?'}</Text>
            </Text>
          </View>

          {/* Data Rows */}
          {[
            { key: "familyHigh", label: "Family High", color: colors.midTeal },
            { key: "familyLow", label: "Family Low", color: colors.midTeal },
            { key: "personalHigh", label: "Personal High", color: colors.darkPurple },
            { key: "personalLow", label: "Personal Low", color: colors.darkPurple },
            { key: "businessHigh", label: "Business High", color: colors.gold },
            { key: "businessLows", label: "Business Lows", color: colors.gold },
          ].map((row) => {
            const rowData = getFeelingData(data, row.key as keyof IJournalData["feelings"]);
            return (
              <View style={styles.tableRow} key={row.key} wrap={false}>
                <Text style={[styles.colArea, { backgroundColor: row.color, color: colors.white, fontFamily: "Helvetica-Bold" }]}>
                  {row.label}
                </Text>
                <Text style={styles.colFeelings}>{rowData.feelings}</Text>
                <Text style={styles.colSituation}>{rowData.situation}</Text>
                <Text style={styles.colSignificance}>{rowData.significance}</Text>
              </View>
            );
          })}
        </View>
      </Page>

      {/* --- PAGE 2: Goals --- */}
      <Page size="A4" style={styles.page}>
        {/* --- Personal Goals Table --- */}
        <View style={styles.goalsTable}>
          {/* Header */}
          <View style={styles.goalsHeaderRow}>
            <Text style={styles.colGoalsLabel}>Personal Goals</Text>
            <Text style={styles.colGoalNum}>Goal #1</Text>
            <Text style={styles.colGoalNum}>Goal #2</Text>
            <Text style={[styles.colGoalNum, { borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: "#0f364d" }]}>Goal #3</Text>
          </View>
          {/* Details Row */}
          <View style={styles.tableRow} wrap={false}>
            <Text style={styles.colDetailsHeader}>
              Details{"\n"}
              <Text style={styles.detailsSubtext}>
                Detail the goal, being specific and measurable.
              </Text>
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightPink }]}>
                {getGoalData(data.personalGoals, i).details}
              </Text>
            ))}
          </View>
          {/* Last Month Row */}
          <View style={styles.tableRow} wrap={false}>
            <Text style={[styles.colGoalsLabel, { backgroundColor: colors.darkPurple, color: colors.white, fontFamily: "Helvetica-Bold" }]}>
              Last Months Goal{"\n"}
              <Text style={[styles.detailsSubtext, { color: "#d0d0e8" }]}>
                (hit / miss)
              </Text>
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightGrayBg }]}>
                {getGoalData(data.personalGoals, i).lastMonth}
              </Text>
            ))}
          </View>
          {/* Next Month Row */}
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]} wrap={false}>
            <Text style={[styles.colGoalsLabel, { backgroundColor: colors.darkPurple, color: colors.white, fontFamily: "Helvetica-Bold" }]}>
              Next Months Goal
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightGrayBg }]}>
                {getGoalData(data.personalGoals, i).nextMonth}
              </Text>
            ))}
          </View>
        </View>

        {/* --- Business Goals Table --- */}
        <View style={styles.goalsTable}>
          {/* Header */}
          <View style={styles.goalsHeaderRow}>
            <Text style={styles.colGoalsLabel}>Business Goals</Text>
            <Text style={styles.colGoalNum}>Goal #1</Text>
            <Text style={styles.colGoalNum}>Goal #2</Text>
            <Text style={[styles.colGoalNum, { borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: "#0f364d" }]}>Goal #3</Text>
          </View>
          {/* Details Row */}
          <View style={styles.tableRow} wrap={false}>
            <Text style={styles.colDetailsHeader}>
              Details{"\n"}
              <Text style={styles.detailsSubtext}>
                Detail the goal, being specific and measurable.
              </Text>
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightPink }]}>
                {getGoalData(data.businessGoals, i).details}
              </Text>
            ))}
          </View>
          {/* Last Month Row */}
          <View style={styles.tableRow} wrap={false}>
            <Text style={[styles.colGoalsLabel, { backgroundColor: colors.gold, color: colors.white, fontFamily: "Helvetica-Bold" }]}>
              Last Months Goal{"\n"}
              <Text style={[styles.detailsSubtext, { color: "#f7f0d7" }]}>
                (hit / miss)
              </Text>
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightGrayBg }]}>
                {getGoalData(data.businessGoals, i).lastMonth}
              </Text>
            ))}
          </View>
          {/* Next Month Row */}
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]} wrap={false}>
            <Text style={[styles.colGoalsLabel, { backgroundColor: colors.gold, color: colors.white, fontFamily: "Helvetica-Bold" }]}>
              Next Months Goal
            </Text>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.colGoalContent, { backgroundColor: colors.lightGrayBg }]}>
                {getGoalData(data.businessGoals, i).nextMonth}
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}