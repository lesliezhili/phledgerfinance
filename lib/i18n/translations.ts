// PHLedger i18n — 7 languages for invoices, payments, refunds, reports
// Languages: English, 简体中文, 繁體中文, 日本語, 한국어, Español, Français

export type Locale = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'es' | 'fr';

export const LOCALES: { code: Locale; name: string; native: string; flag: string }[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
];

export interface Translations {
  // Navigation
  nav_home: string;
  nav_dashboard: string;
  nav_invoices: string;
  nav_payments: string;
  nav_refunds: string;
  nav_reports: string;
  nav_settings: string;
  nav_sign_in: string;
  nav_sign_up: string;
  nav_sign_out: string;
  nav_pricing: string;
  nav_feedback: string;
  nav_about: string;

  // Invoice
  invoice_title: string;
  invoice_number: string;
  invoice_date: string;
  invoice_due_date: string;
  invoice_from: string;
  invoice_to: string;
  invoice_description: string;
  invoice_quantity: string;
  invoice_unit_price: string;
  invoice_amount: string;
  invoice_subtotal: string;
  invoice_tax: string;
  invoice_tax_gst: string;
  invoice_tax_hst: string;
  invoice_total: string;
  invoice_paid: string;
  invoice_unpaid: string;
  invoice_overdue: string;
  invoice_draft: string;
  invoice_sent: string;
  invoice_create: string;
  invoice_download_pdf: string;
  invoice_send: string;
  invoice_payment_terms: string;
  invoice_notes: string;
  invoice_bank_details: string;

  // Payment
  payment_title: string;
  payment_amount: string;
  payment_currency: string;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  payment_reference: string;
  payment_recipient: string;
  payment_sender: string;
  payment_fee: string;
  payment_net: string;
  payment_initiated: string;
  payment_processing: string;
  payment_settled: string;
  payment_failed: string;
  payment_cancelled: string;
  payment_confirm: string;
  payment_rail_payto: string;
  payment_rail_interac: string;
  payment_rail_bank: string;
  payment_speed: string;
  payment_realtime: string;

  // Refund
  refund_title: string;
  refund_amount: string;
  refund_reason: string;
  refund_status: string;
  refund_date: string;
  refund_original_payment: string;
  refund_full: string;
  refund_partial: string;
  refund_approved: string;
  refund_rejected: string;
  refund_pending: string;
  refund_processed: string;
  refund_request: string;
  refund_policy: string;

  // Reports / Financial
  report_title: string;
  report_pnl: string;
  report_balance_sheet: string;
  report_bas: string;
  report_tax_return: string;
  report_cash_flow: string;
  report_revenue: string;
  report_expenses: string;
  report_net_profit: string;
  report_net_loss: string;
  report_period: string;
  report_ytd: string;
  report_quarterly: string;
  report_annual: string;
  report_export: string;
  report_gst_collected: string;
  report_gst_paid: string;
  report_gst_net: string;

  // Common
  common_save: string;
  common_cancel: string;
  common_edit: string;
  common_delete: string;
  common_search: string;
  common_filter: string;
  common_sort: string;
  common_loading: string;
  common_error: string;
  common_success: string;
  common_confirm: string;
  common_back: string;
  common_next: string;
  common_total: string;
  common_date: string;
  common_status: string;
  common_actions: string;
  common_no_data: string;
  common_powered_by: string;
}

const en: Translations = {
  nav_home: 'Home', nav_dashboard: 'Dashboard', nav_invoices: 'Invoices', nav_payments: 'Payments', nav_refunds: 'Refunds', nav_reports: 'Reports', nav_settings: 'Settings', nav_sign_in: 'Sign In', nav_sign_up: 'Sign Up', nav_sign_out: 'Sign Out', nav_pricing: 'Pricing', nav_feedback: 'Feedback', nav_about: 'About',
  invoice_title: 'Invoice', invoice_number: 'Invoice Number', invoice_date: 'Invoice Date', invoice_due_date: 'Due Date', invoice_from: 'From', invoice_to: 'To', invoice_description: 'Description', invoice_quantity: 'Qty', invoice_unit_price: 'Unit Price', invoice_amount: 'Amount', invoice_subtotal: 'Subtotal', invoice_tax: 'Tax', invoice_tax_gst: 'GST (10%)', invoice_tax_hst: 'HST (5%)', invoice_total: 'Total', invoice_paid: 'Paid', invoice_unpaid: 'Unpaid', invoice_overdue: 'Overdue', invoice_draft: 'Draft', invoice_sent: 'Sent', invoice_create: 'Create Invoice', invoice_download_pdf: 'Download PDF', invoice_send: 'Send Invoice', invoice_payment_terms: 'Payment Terms', invoice_notes: 'Notes', invoice_bank_details: 'Bank Details',
  payment_title: 'Payment', payment_amount: 'Amount', payment_currency: 'Currency', payment_method: 'Method', payment_status: 'Status', payment_date: 'Date', payment_reference: 'Reference', payment_recipient: 'Recipient', payment_sender: 'Sender', payment_fee: 'Fee', payment_net: 'Net Amount', payment_initiated: 'Initiated', payment_processing: 'Processing', payment_settled: 'Settled', payment_failed: 'Failed', payment_cancelled: 'Cancelled', payment_confirm: 'Confirm Payment', payment_rail_payto: 'PayTo NPP (Real-time)', payment_rail_interac: 'Interac e-Transfer', payment_rail_bank: 'Bank Transfer', payment_speed: 'Speed', payment_realtime: 'Real-time',
  refund_title: 'Refund', refund_amount: 'Refund Amount', refund_reason: 'Reason', refund_status: 'Status', refund_date: 'Date', refund_original_payment: 'Original Payment', refund_full: 'Full Refund', refund_partial: 'Partial Refund', refund_approved: 'Approved', refund_rejected: 'Rejected', refund_pending: 'Pending', refund_processed: 'Processed', refund_request: 'Request Refund', refund_policy: 'Refund Policy',
  report_title: 'Reports', report_pnl: 'Profit & Loss', report_balance_sheet: 'Balance Sheet', report_bas: 'BAS / GST Return', report_tax_return: 'Tax Return', report_cash_flow: 'Cash Flow', report_revenue: 'Revenue', report_expenses: 'Expenses', report_net_profit: 'Net Profit', report_net_loss: 'Net Loss', report_period: 'Period', report_ytd: 'Year to Date', report_quarterly: 'Quarterly', report_annual: 'Annual', report_export: 'Export', report_gst_collected: 'GST Collected', report_gst_paid: 'GST Paid (ITCs)', report_gst_net: 'Net GST Payable',
  common_save: 'Save', common_cancel: 'Cancel', common_edit: 'Edit', common_delete: 'Delete', common_search: 'Search', common_filter: 'Filter', common_sort: 'Sort', common_loading: 'Loading...', common_error: 'Error', common_success: 'Success', common_confirm: 'Confirm', common_back: 'Back', common_next: 'Next', common_total: 'Total', common_date: 'Date', common_status: 'Status', common_actions: 'Actions', common_no_data: 'No data available', common_powered_by: 'Powered by PHLedger',
};

const zhCN: Translations = {
  nav_home: '首页', nav_dashboard: '仪表盘', nav_invoices: '发票', nav_payments: '付款', nav_refunds: '退款', nav_reports: '报表', nav_settings: '设置', nav_sign_in: '登录', nav_sign_up: '注册', nav_sign_out: '退出', nav_pricing: '定价', nav_feedback: '反馈', nav_about: '关于',
  invoice_title: '发票', invoice_number: '发票编号', invoice_date: '开票日期', invoice_due_date: '到期日', invoice_from: '开票方', invoice_to: '收票方', invoice_description: '描述', invoice_quantity: '数量', invoice_unit_price: '单价', invoice_amount: '金额', invoice_subtotal: '小计', invoice_tax: '税费', invoice_tax_gst: '商品服务税 (10%)', invoice_tax_hst: '统一销售税 (5%)', invoice_total: '合计', invoice_paid: '已付款', invoice_unpaid: '未付款', invoice_overdue: '逾期', invoice_draft: '草稿', invoice_sent: '已发送', invoice_create: '创建发票', invoice_download_pdf: '下载PDF', invoice_send: '发送发票', invoice_payment_terms: '付款条件', invoice_notes: '备注', invoice_bank_details: '银行信息',
  payment_title: '付款', payment_amount: '金额', payment_currency: '货币', payment_method: '支付方式', payment_status: '状态', payment_date: '日期', payment_reference: '参考号', payment_recipient: '收款方', payment_sender: '付款方', payment_fee: '手续费', payment_net: '实收金额', payment_initiated: '已发起', payment_processing: '处理中', payment_settled: '已结算', payment_failed: '失败', payment_cancelled: '已取消', payment_confirm: '确认付款', payment_rail_payto: 'PayTo即时转账', payment_rail_interac: 'Interac电子转账', payment_rail_bank: '银行转账', payment_speed: '速度', payment_realtime: '实时到账',
  refund_title: '退款', refund_amount: '退款金额', refund_reason: '退款原因', refund_status: '状态', refund_date: '日期', refund_original_payment: '原始付款', refund_full: '全额退款', refund_partial: '部分退款', refund_approved: '已批准', refund_rejected: '已拒绝', refund_pending: '待处理', refund_processed: '已处理', refund_request: '申请退款', refund_policy: '退款政策',
  report_title: '报表', report_pnl: '损益表', report_balance_sheet: '资产负债表', report_bas: '商业活动报表', report_tax_return: '税务申报', report_cash_flow: '现金流', report_revenue: '收入', report_expenses: '支出', report_net_profit: '净利润', report_net_loss: '净亏损', report_period: '期间', report_ytd: '年初至今', report_quarterly: '季度', report_annual: '年度', report_export: '导出', report_gst_collected: '已收GST', report_gst_paid: '已付GST（进项）', report_gst_net: 'GST应缴净额',
  common_save: '保存', common_cancel: '取消', common_edit: '编辑', common_delete: '删除', common_search: '搜索', common_filter: '筛选', common_sort: '排序', common_loading: '加载中...', common_error: '错误', common_success: '成功', common_confirm: '确认', common_back: '返回', common_next: '下一步', common_total: '合计', common_date: '日期', common_status: '状态', common_actions: '操作', common_no_data: '暂无数据', common_powered_by: 'PHLedger 提供技术支持',
};

const zhTW: Translations = {
  nav_home: '首頁', nav_dashboard: '儀表板', nav_invoices: '發票', nav_payments: '付款', nav_refunds: '退款', nav_reports: '報表', nav_settings: '設定', nav_sign_in: '登入', nav_sign_up: '註冊', nav_sign_out: '登出', nav_pricing: '定價', nav_feedback: '意見回饋', nav_about: '關於',
  invoice_title: '發票', invoice_number: '發票編號', invoice_date: '開票日期', invoice_due_date: '到期日', invoice_from: '開票方', invoice_to: '收票方', invoice_description: '說明', invoice_quantity: '數量', invoice_unit_price: '單價', invoice_amount: '金額', invoice_subtotal: '小計', invoice_tax: '稅額', invoice_tax_gst: '商品服務稅 (10%)', invoice_tax_hst: '統一銷售稅 (5%)', invoice_total: '合計', invoice_paid: '已付款', invoice_unpaid: '未付款', invoice_overdue: '逾期', invoice_draft: '草稿', invoice_sent: '已發送', invoice_create: '建立發票', invoice_download_pdf: '下載PDF', invoice_send: '傳送發票', invoice_payment_terms: '付款條件', invoice_notes: '備註', invoice_bank_details: '銀行資訊',
  payment_title: '付款', payment_amount: '金額', payment_currency: '貨幣', payment_method: '付款方式', payment_status: '狀態', payment_date: '日期', payment_reference: '參考編號', payment_recipient: '收款方', payment_sender: '付款方', payment_fee: '手續費', payment_net: '實收金額', payment_initiated: '已發起', payment_processing: '處理中', payment_settled: '已結算', payment_failed: '失敗', payment_cancelled: '已取消', payment_confirm: '確認付款', payment_rail_payto: 'PayTo即時轉帳', payment_rail_interac: 'Interac電子轉帳', payment_rail_bank: '銀行轉帳', payment_speed: '速度', payment_realtime: '即時到帳',
  refund_title: '退款', refund_amount: '退款金額', refund_reason: '退款原因', refund_status: '狀態', refund_date: '日期', refund_original_payment: '原始付款', refund_full: '全額退款', refund_partial: '部分退款', refund_approved: '已核准', refund_rejected: '已拒絕', refund_pending: '待處理', refund_processed: '已處理', refund_request: '申請退款', refund_policy: '退款政策',
  report_title: '報表', report_pnl: '損益表', report_balance_sheet: '資產負債表', report_bas: '商業活動報表', report_tax_return: '稅務申報', report_cash_flow: '現金流量', report_revenue: '營收', report_expenses: '費用', report_net_profit: '淨利', report_net_loss: '淨損', report_period: '期間', report_ytd: '年初至今', report_quarterly: '季度', report_annual: '年度', report_export: '匯出', report_gst_collected: '已收GST', report_gst_paid: '已付GST（進項）', report_gst_net: 'GST應繳淨額',
  common_save: '儲存', common_cancel: '取消', common_edit: '編輯', common_delete: '刪除', common_search: '搜尋', common_filter: '篩選', common_sort: '排序', common_loading: '載入中...', common_error: '錯誤', common_success: '成功', common_confirm: '確認', common_back: '返回', common_next: '下一步', common_total: '合計', common_date: '日期', common_status: '狀態', common_actions: '操作', common_no_data: '尚無資料', common_powered_by: 'PHLedger 技術支援',
};

const ja: Translations = {
  nav_home: 'ホーム', nav_dashboard: 'ダッシュボード', nav_invoices: '請求書', nav_payments: '支払い', nav_refunds: '返金', nav_reports: 'レポート', nav_settings: '設定', nav_sign_in: 'ログイン', nav_sign_up: '新規登録', nav_sign_out: 'ログアウト', nav_pricing: '料金', nav_feedback: 'フィードバック', nav_about: '概要',
  invoice_title: '請求書', invoice_number: '請求書番号', invoice_date: '発行日', invoice_due_date: '支払期限', invoice_from: '請求元', invoice_to: '請求先', invoice_description: '摘要', invoice_quantity: '数量', invoice_unit_price: '単価', invoice_amount: '金額', invoice_subtotal: '小計', invoice_tax: '税額', invoice_tax_gst: 'GST (10%)', invoice_tax_hst: 'HST (5%)', invoice_total: '合計', invoice_paid: '支払済', invoice_unpaid: '未払い', invoice_overdue: '期限超過', invoice_draft: '下書き', invoice_sent: '送信済', invoice_create: '請求書作成', invoice_download_pdf: 'PDF出力', invoice_send: '請求書送信', invoice_payment_terms: '支払条件', invoice_notes: '備考', invoice_bank_details: '振込先情報',
  payment_title: '支払い', payment_amount: '金額', payment_currency: '通貨', payment_method: '支払方法', payment_status: 'ステータス', payment_date: '日付', payment_reference: '参照番号', payment_recipient: '受取人', payment_sender: '送金人', payment_fee: '手数料', payment_net: '手取額', payment_initiated: '処理開始', payment_processing: '処理中', payment_settled: '決済完了', payment_failed: '失敗', payment_cancelled: 'キャンセル', payment_confirm: '支払確認', payment_rail_payto: 'PayToリアルタイム送金', payment_rail_interac: 'Interac送金', payment_rail_bank: '銀行振込', payment_speed: '処理速度', payment_realtime: 'リアルタイム',
  refund_title: '返金', refund_amount: '返金額', refund_reason: '理由', refund_status: 'ステータス', refund_date: '日付', refund_original_payment: '元取引', refund_full: '全額返金', refund_partial: '一部返金', refund_approved: '承認済', refund_rejected: '却下', refund_pending: '保留中', refund_processed: '処理済', refund_request: '返金申請', refund_policy: '返金ポリシー',
  report_title: 'レポート', report_pnl: '損益計算書', report_balance_sheet: '貸借対照表', report_bas: '事業活動報告書', report_tax_return: '確定申告', report_cash_flow: 'キャッシュフロー', report_revenue: '売上', report_expenses: '経費', report_net_profit: '純利益', report_net_loss: '純損失', report_period: '期間', report_ytd: '年度累計', report_quarterly: '四半期', report_annual: '年次', report_export: 'エクスポート', report_gst_collected: 'GST徴収額', report_gst_paid: 'GST支払額', report_gst_net: 'GST納付額',
  common_save: '保存', common_cancel: 'キャンセル', common_edit: '編集', common_delete: '削除', common_search: '検索', common_filter: 'フィルター', common_sort: '並び替え', common_loading: '読み込み中...', common_error: 'エラー', common_success: '成功', common_confirm: '確認', common_back: '戻る', common_next: '次へ', common_total: '合計', common_date: '日付', common_status: 'ステータス', common_actions: '操作', common_no_data: 'データがありません', common_powered_by: 'PHLedger提供',
};

const ko: Translations = {
  nav_home: '홈', nav_dashboard: '대시보드', nav_invoices: '청구서', nav_payments: '결제', nav_refunds: '환불', nav_reports: '보고서', nav_settings: '설정', nav_sign_in: '로그인', nav_sign_up: '회원가입', nav_sign_out: '로그아웃', nav_pricing: '요금제', nav_feedback: '피드백', nav_about: '소개',
  invoice_title: '청구서', invoice_number: '청구서 번호', invoice_date: '발행일', invoice_due_date: '결제 기한', invoice_from: '발행인', invoice_to: '수신인', invoice_description: '설명', invoice_quantity: '수량', invoice_unit_price: '단가', invoice_amount: '금액', invoice_subtotal: '소계', invoice_tax: '세금', invoice_tax_gst: 'GST (10%)', invoice_tax_hst: 'HST (5%)', invoice_total: '합계', invoice_paid: '결제 완료', invoice_unpaid: '미결제', invoice_overdue: '연체', invoice_draft: '임시저장', invoice_sent: '발송 완료', invoice_create: '청구서 작성', invoice_download_pdf: 'PDF 다운로드', invoice_send: '청구서 발송', invoice_payment_terms: '결제 조건', invoice_notes: '메모', invoice_bank_details: '계좌 정보',
  payment_title: '결제', payment_amount: '금액', payment_currency: '통화', payment_method: '결제 수단', payment_status: '상태', payment_date: '날짜', payment_reference: '참조번호', payment_recipient: '수취인', payment_sender: '송금인', payment_fee: '수수료', payment_net: '실수령액', payment_initiated: '처리 시작', payment_processing: '처리 중', payment_settled: '정산 완료', payment_failed: '실패', payment_cancelled: '취소됨', payment_confirm: '결제 확인', payment_rail_payto: 'PayTo 실시간 이체', payment_rail_interac: 'Interac 전자이체', payment_rail_bank: '은행 이체', payment_speed: '속도', payment_realtime: '실시간',
  refund_title: '환불', refund_amount: '환불 금액', refund_reason: '사유', refund_status: '상태', refund_date: '날짜', refund_original_payment: '원 결제', refund_full: '전액 환불', refund_partial: '부분 환불', refund_approved: '승인됨', refund_rejected: '거절됨', refund_pending: '대기 중', refund_processed: '처리 완료', refund_request: '환불 요청', refund_policy: '환불 정책',
  report_title: '보고서', report_pnl: '손익계산서', report_balance_sheet: '대차대조표', report_bas: '사업활동보고서', report_tax_return: '세금 신고', report_cash_flow: '현금흐름', report_revenue: '매출', report_expenses: '비용', report_net_profit: '순이익', report_net_loss: '순손실', report_period: '기간', report_ytd: '연초 누계', report_quarterly: '분기', report_annual: '연간', report_export: '내보내기', report_gst_collected: 'GST 징수액', report_gst_paid: 'GST 납부액', report_gst_net: 'GST 순납부액',
  common_save: '저장', common_cancel: '취소', common_edit: '수정', common_delete: '삭제', common_search: '검색', common_filter: '필터', common_sort: '정렬', common_loading: '로딩 중...', common_error: '오류', common_success: '성공', common_confirm: '확인', common_back: '뒤로', common_next: '다음', common_total: '합계', common_date: '날짜', common_status: '상태', common_actions: '작업', common_no_data: '데이터 없음', common_powered_by: 'PHLedger 제공',
};

const es: Translations = {
  nav_home: 'Inicio', nav_dashboard: 'Panel', nav_invoices: 'Facturas', nav_payments: 'Pagos', nav_refunds: 'Reembolsos', nav_reports: 'Informes', nav_settings: 'Configuración', nav_sign_in: 'Iniciar sesión', nav_sign_up: 'Registrarse', nav_sign_out: 'Cerrar sesión', nav_pricing: 'Precios', nav_feedback: 'Comentarios', nav_about: 'Acerca de',
  invoice_title: 'Factura', invoice_number: 'Número de factura', invoice_date: 'Fecha de emisión', invoice_due_date: 'Fecha de vencimiento', invoice_from: 'De', invoice_to: 'Para', invoice_description: 'Descripción', invoice_quantity: 'Cant.', invoice_unit_price: 'Precio unitario', invoice_amount: 'Importe', invoice_subtotal: 'Subtotal', invoice_tax: 'Impuesto', invoice_tax_gst: 'GST (10%)', invoice_tax_hst: 'HST (5%)', invoice_total: 'Total', invoice_paid: 'Pagada', invoice_unpaid: 'Pendiente', invoice_overdue: 'Vencida', invoice_draft: 'Borrador', invoice_sent: 'Enviada', invoice_create: 'Crear factura', invoice_download_pdf: 'Descargar PDF', invoice_send: 'Enviar factura', invoice_payment_terms: 'Condiciones de pago', invoice_notes: 'Notas', invoice_bank_details: 'Datos bancarios',
  payment_title: 'Pago', payment_amount: 'Monto', payment_currency: 'Moneda', payment_method: 'Método', payment_status: 'Estado', payment_date: 'Fecha', payment_reference: 'Referencia', payment_recipient: 'Destinatario', payment_sender: 'Remitente', payment_fee: 'Comisión', payment_net: 'Monto neto', payment_initiated: 'Iniciado', payment_processing: 'Procesando', payment_settled: 'Liquidado', payment_failed: 'Fallido', payment_cancelled: 'Cancelado', payment_confirm: 'Confirmar pago', payment_rail_payto: 'PayTo tiempo real', payment_rail_interac: 'Interac transferencia', payment_rail_bank: 'Transferencia bancaria', payment_speed: 'Velocidad', payment_realtime: 'Tiempo real',
  refund_title: 'Reembolso', refund_amount: 'Monto del reembolso', refund_reason: 'Motivo', refund_status: 'Estado', refund_date: 'Fecha', refund_original_payment: 'Pago original', refund_full: 'Reembolso total', refund_partial: 'Reembolso parcial', refund_approved: 'Aprobado', refund_rejected: 'Rechazado', refund_pending: 'Pendiente', refund_processed: 'Procesado', refund_request: 'Solicitar reembolso', refund_policy: 'Política de reembolsos',
  report_title: 'Informes', report_pnl: 'Estado de resultados', report_balance_sheet: 'Balance general', report_bas: 'Declaración de actividad', report_tax_return: 'Declaración fiscal', report_cash_flow: 'Flujo de caja', report_revenue: 'Ingresos', report_expenses: 'Gastos', report_net_profit: 'Beneficio neto', report_net_loss: 'Pérdida neta', report_period: 'Período', report_ytd: 'Acumulado anual', report_quarterly: 'Trimestral', report_annual: 'Anual', report_export: 'Exportar', report_gst_collected: 'GST cobrado', report_gst_paid: 'GST pagado', report_gst_net: 'GST neto a pagar',
  common_save: 'Guardar', common_cancel: 'Cancelar', common_edit: 'Editar', common_delete: 'Eliminar', common_search: 'Buscar', common_filter: 'Filtrar', common_sort: 'Ordenar', common_loading: 'Cargando...', common_error: 'Error', common_success: 'Éxito', common_confirm: 'Confirmar', common_back: 'Atrás', common_next: 'Siguiente', common_total: 'Total', common_date: 'Fecha', common_status: 'Estado', common_actions: 'Acciones', common_no_data: 'Sin datos', common_powered_by: 'Desarrollado por PHLedger',
};

const fr: Translations = {
  nav_home: 'Accueil', nav_dashboard: 'Tableau de bord', nav_invoices: 'Factures', nav_payments: 'Paiements', nav_refunds: 'Remboursements', nav_reports: 'Rapports', nav_settings: 'Paramètres', nav_sign_in: 'Se connecter', nav_sign_up: "S'inscrire", nav_sign_out: 'Déconnexion', nav_pricing: 'Tarifs', nav_feedback: 'Avis', nav_about: 'À propos',
  invoice_title: 'Facture', invoice_number: 'Numéro de facture', invoice_date: "Date d'émission", invoice_due_date: "Date d'échéance", invoice_from: 'De', invoice_to: 'À', invoice_description: 'Description', invoice_quantity: 'Qté', invoice_unit_price: 'Prix unitaire', invoice_amount: 'Montant', invoice_subtotal: 'Sous-total', invoice_tax: 'Taxe', invoice_tax_gst: 'GST (10%)', invoice_tax_hst: 'HST (5%)', invoice_total: 'Total', invoice_paid: 'Payée', invoice_unpaid: 'Impayée', invoice_overdue: 'En retard', invoice_draft: 'Brouillon', invoice_sent: 'Envoyée', invoice_create: 'Créer une facture', invoice_download_pdf: 'Télécharger PDF', invoice_send: 'Envoyer la facture', invoice_payment_terms: 'Conditions de paiement', invoice_notes: 'Notes', invoice_bank_details: 'Coordonnées bancaires',
  payment_title: 'Paiement', payment_amount: 'Montant', payment_currency: 'Devise', payment_method: 'Méthode', payment_status: 'Statut', payment_date: 'Date', payment_reference: 'Référence', payment_recipient: 'Bénéficiaire', payment_sender: 'Expéditeur', payment_fee: 'Frais', payment_net: 'Montant net', payment_initiated: 'Initié', payment_processing: 'En cours', payment_settled: 'Réglé', payment_failed: 'Échoué', payment_cancelled: 'Annulé', payment_confirm: 'Confirmer le paiement', payment_rail_payto: 'PayTo temps réel', payment_rail_interac: 'Interac virement', payment_rail_bank: 'Virement bancaire', payment_speed: 'Rapidité', payment_realtime: 'Temps réel',
  refund_title: 'Remboursement', refund_amount: 'Montant du remboursement', refund_reason: 'Motif', refund_status: 'Statut', refund_date: 'Date', refund_original_payment: 'Paiement original', refund_full: 'Remboursement intégral', refund_partial: 'Remboursement partiel', refund_approved: 'Approuvé', refund_rejected: 'Refusé', refund_pending: 'En attente', refund_processed: 'Traité', refund_request: 'Demander un remboursement', refund_policy: 'Politique de remboursement',
  report_title: 'Rapports', report_pnl: 'Compte de résultat', report_balance_sheet: 'Bilan', report_bas: "Déclaration d'activité", report_tax_return: 'Déclaration fiscale', report_cash_flow: 'Flux de trésorerie', report_revenue: 'Chiffre d\'affaires', report_expenses: 'Charges', report_net_profit: 'Bénéfice net', report_net_loss: 'Perte nette', report_period: 'Période', report_ytd: 'Cumul annuel', report_quarterly: 'Trimestriel', report_annual: 'Annuel', report_export: 'Exporter', report_gst_collected: 'GST collectée', report_gst_paid: 'GST payée', report_gst_net: 'GST nette à payer',
  common_save: 'Enregistrer', common_cancel: 'Annuler', common_edit: 'Modifier', common_delete: 'Supprimer', common_search: 'Rechercher', common_filter: 'Filtrer', common_sort: 'Trier', common_loading: 'Chargement...', common_error: 'Erreur', common_success: 'Succès', common_confirm: 'Confirmer', common_back: 'Retour', common_next: 'Suivant', common_total: 'Total', common_date: 'Date', common_status: 'Statut', common_actions: 'Actions', common_no_data: 'Aucune donnée', common_powered_by: 'Propulsé par PHLedger',

  invoice_date: 'Date de facture',
  invoice_due_date: 'Date d\'\u00e9ch\u00e9ance',
  nav_sign_up: 'S\'inscrire',
  report_bas: 'D\u00e9claration BAS / TPS',
};

export const TRANSLATIONS: Record<Locale, Translations> = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, ko, es, fr };

export function t(locale: Locale, key: keyof Translations): string {
  return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
}

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('ph_locale') as Locale) || 'en';
}

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') localStorage.setItem('ph_locale', locale);
}
