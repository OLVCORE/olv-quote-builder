import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { QuoteInput, QuoteResult } from './pricingEngine';

const styles = StyleSheet.create({
  page: { padding: 32 },
  title: { fontSize: 18, marginBottom: 16 },
  section: { marginBottom: 8 },
});

export function QuotePDF({ input, result }: { input: QuoteInput; result: QuoteResult }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Proposta – OLV Consultoria</Text>
        <View style={styles.section}>
          <Text>TEU/ano: {input.teuPerYear}</Text>
          <Text>CIF anual: R$ {input.cifPerYear.toLocaleString('pt-BR')}</Text>
        </View>
        <View style={styles.section}>
          <Text>Retainer: R$ {result.retainer.toLocaleString('pt-BR')}/mês</Text>
          <Text>Taxa variável: {result.variableRate}%</Text>
          <Text>ROI 12m: {result.roi12m}%</Text>
          <Text>Payback: {result.paybackMonths} meses</Text>
        </View>
        <Text style={{ fontSize: 10, marginTop: 24 }}>
          Valores indicativos. Sujeito a ajuste após diagnóstico detalhado.
        </Text>
      </Page>
    </Document>
  );
} 