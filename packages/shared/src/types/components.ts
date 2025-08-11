

// 基础组件属性
export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
}

// 按钮组件属性
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

// 连接按钮属性
export interface ConnectButtonProps extends ButtonProps {
  showWalletIcon?: boolean;
  showBalance?: boolean;
  showNetworkIndicator?: boolean;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// 模态框属性
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animation?: 'fade' | 'slide' | 'scale';
  children?: React.ReactNode;
}

// 卡片组件属性
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// 输入框组件属性
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  state?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

// 账户信息组件属性
export interface AccountInfoProps extends BaseComponentProps {
  variant?: 'default' | 'compact' | 'detailed';
  showWallet?: boolean;
  showBalance?: boolean;
  showNetwork?: boolean;
  showCopyButton?: boolean;
  showQRCode?: boolean;
  showPublicKey?: boolean;
  showNetworkSwitch?: boolean;
  addressFormat?: 'short' | 'medium' | 'full';
  balancePrecision?: number;
}

// 网络切换组件属性
export interface NetworkSwitchProps extends BaseComponentProps {
  showTestnet?: boolean;
  showRegtest?: boolean;
  variant?: 'select' | 'button' | 'compact' | 'status';
  size?: 'sm' | 'md' | 'lg';
  onNetworkChange?: (network: string) => void;
  label?: string;
  showIcon?: boolean;
  showDescription?: boolean;
}

// 钱包选择组件属性
export interface WalletSelectProps extends BaseComponentProps {
  layout?: 'grid' | 'list';
  showFeatured?: boolean;
  showSearch?: boolean;
  onWalletSelect?: (walletId: string) => void;
  onWalletConnect?: (walletId: string) => void;
}

// 钱包模态框属性
export interface WalletModalProps extends ModalProps {
  showFeatured?: boolean;
  showSearch?: boolean;
  onWalletSelect?: (walletId: string) => void;
  onWalletConnect?: (walletId: string) => void;
}

// 主题切换组件属性
export interface ThemeToggleProps extends BaseComponentProps {
  variant?: 'button' | 'switch' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// 网络状态组件属性
export interface NetworkStatusProps extends BaseComponentProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'card';
  network?: string;
}

// 加载状态组件属性
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'bars';
  text?: string;
}

// 错误提示组件属性
export interface ErrorProps extends BaseComponentProps {
  error: Error | string;
  variant?: 'inline' | 'card' | 'toast';
  onRetry?: () => void;
  onDismiss?: () => void;
}

// 通知组件属性
export interface NotificationProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

// 工具提示组件属性
export interface TooltipProps extends BaseComponentProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
}

// 下拉菜单组件属性
export interface DropdownProps extends BaseComponentProps {
  items: DropdownItem[];
  onSelect?: (item: DropdownItem) => void;
  trigger?: 'hover' | 'click';
  placement?: 'bottom' | 'top';
}

// 下拉菜单项
export interface DropdownItem {
  id: string;
  label: string;
  value?: any;
  disabled?: boolean;
  icon?: string;
  children?: DropdownItem[];
}

// 标签组件属性
export interface TagProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
}

// 进度条组件属性
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

// 徽章组件属性
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  count?: number;
}

// 头像组件属性
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: string;
}

// 分隔线组件属性
export interface DividerProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

// 空状态组件属性
export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 列表组件属性
export interface ListProps extends BaseComponentProps {
  items: ListItem[];
  variant?: 'default' | 'bordered' | 'hover';
  size?: 'sm' | 'md' | 'lg';
  onSelect?: (item: ListItem) => void;
}

// 列表项
export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  value?: any;
  children?: ListItem[];
}

// 表格组件属性
export interface TableProps extends BaseComponentProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (row: any) => void;
}

// 表格列
export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// 表单组件属性
export interface FormProps extends BaseComponentProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  children?: React.ReactNode;
}

// 表单项属性
export interface FormItemProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  rules?: FormRule[];
  children?: React.ReactNode;
}

// 表单验证规则
export interface FormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string | Promise<boolean | string>;
}

// 标签页组件属性
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'segment';
  size?: 'sm' | 'md' | 'lg';
}

// 标签页项
export interface TabItem {
  key: string;
  label: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// 步骤条组件属性
export interface StepsProps extends BaseComponentProps {
  items: StepItem[];
  current?: number;
  onChange?: (current: number) => void;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

// 步骤条项
export interface StepItem {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

// 时间选择器组件属性
export interface TimePickerProps extends BaseComponentProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
}

// 日期选择器组件属性
export interface DatePickerProps extends BaseComponentProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
  min?: Date;
  max?: Date;
}

// 颜色选择器组件属性
export interface ColorPickerProps extends BaseComponentProps {
  value?: string;
  onChange?: (color: string) => void;
  presetColors?: string[];
  disabled?: boolean;
}

// 滑块组件属性
export interface SliderProps extends BaseComponentProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showMarks?: boolean;
}

// 评分组件属性
export interface RateProps extends BaseComponentProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  disabled?: boolean;
  allowHalf?: boolean;
  character?: React.ReactNode;
}

// 开关组件属性
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// 单选框组件属性
export interface RadioProps extends BaseComponentProps {
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  options?: RadioOption[];
}

// 单选框选项
export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

// 复选框组件属性
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

// 选择器组件属性
export interface SelectProps extends BaseComponentProps {
  value?: any;
  onChange?: (value: any) => void;
  options?: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  loading?: boolean;
}

// 选择器选项
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  children?: SelectOption[];
}

// 文件上传组件属性
export interface UploadProps extends BaseComponentProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  upload?: (file: File) => Promise<string>;
}

// 图片组件属性
export interface ImageProps extends BaseComponentProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallback?: string;
  preview?: boolean;
  loading?: 'lazy' | 'eager';
}

// 视频组件属性
export interface VideoProps extends BaseComponentProps {
  src: string;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: number | string;
  height?: number | string;
}

// 音频组件属性
export interface AudioProps extends BaseComponentProps {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

// 代码块组件属性
export interface CodeBlockProps extends BaseComponentProps {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
  lineNumbers?: boolean;
  copyable?: boolean;
}

// 标记组件属性
export interface HighlightProps extends BaseComponentProps {
  text: string;
  highlight: string;
  caseSensitive?: boolean;
  className?: string;
}

// 虚拟列表组件属性
export interface VirtualListProps extends BaseComponentProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  onScroll?: (scrollInfo: { scrollTop: number; scrollLeft: number }) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

// 无限滚动组件属性
export interface InfiniteScrollProps extends BaseComponentProps {
  dataLength: number;
  next: () => Promise<void> | void;
  hasMore: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  scrollableTarget?: string | HTMLElement;
}

// 拖拽组件属性
export interface DraggableProps extends BaseComponentProps {
  children: React.ReactNode;
  onDragStart?: (event: React.DragEvent) => void;
  onDrag?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  draggable?: boolean;
}

// 拖拽放置区域组件属性
export interface DroppableProps extends BaseComponentProps {
  children: React.ReactNode;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  accept?: string[];
}

// 响应式组件属性
export interface ResponsiveProps extends BaseComponentProps {
  children: React.ReactNode;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

// 国际化组件属性
export interface I18nProps extends BaseComponentProps {
  children: React.ReactNode;
  locale: string;
  fallback?: React.ReactNode;
  messages?: Record<string, Record<string, string>>;
}

// 权限控制组件属性
export interface PermissionProps extends BaseComponentProps {
  children: React.ReactNode;
  permission: string | string[];
  fallback?: React.ReactNode;
  hasPermission?: (permission: string | string[]) => boolean;
}

// 错误边界组件属性
export interface ErrorBoundaryProps extends BaseComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// 性能监控组件属性
export interface PerformanceProps extends BaseComponentProps {
  children: React.ReactNode;
  name?: string;
  onRender?: (metrics: { duration: number; startTime: number; endTime: number }) => void;
  threshold?: number;
}

// A/B 测试组件属性
export interface ABTestProps extends BaseComponentProps {
  children: React.ReactNode;
  name: string;
  variant: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
}

// 特性开关组件属性
export interface FeatureFlagProps extends BaseComponentProps {
  children: React.ReactNode;
  flag: string;
  fallback?: React.ReactNode;
  enabled?: boolean;
}

// 水印组件属性
export interface WatermarkProps extends BaseComponentProps {
  children: React.ReactNode;
  content: string;
  fontColor?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  gap?: [number, number];
  rotate?: number;
  zIndex?: number;
}

// 全屏组件属性
export interface FullscreenProps extends BaseComponentProps {
  children: React.ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
  enabled?: boolean;
}

// 打印组件属性
export interface PrintProps extends BaseComponentProps {
  children: React.ReactNode;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  trigger?: React.ReactNode;
}

// 导出所有组件类型
export type ComponentProps = {
  Button: ButtonProps;
  ConnectButton: ConnectButtonProps;
  Modal: ModalProps;
  Card: CardProps;
  Input: InputProps;
  AccountInfo: AccountInfoProps;
  NetworkSwitch: NetworkSwitchProps;
  WalletSelect: WalletSelectProps;
  WalletModal: WalletModalProps;
  ThemeToggle: ThemeToggleProps;
  NetworkStatus: NetworkStatusProps;
  Loading: LoadingProps;
  Error: ErrorProps;
  Notification: NotificationProps;
  Tooltip: TooltipProps;
  Dropdown: DropdownProps;
  Tag: TagProps;
  Progress: ProgressProps;
  Badge: BadgeProps;
  Avatar: AvatarProps;
  Divider: DividerProps;
  EmptyState: EmptyStateProps;
  List: ListProps;
  Table: TableProps;
  Form: FormProps;
  FormItem: FormItemProps;
  Tabs: TabsProps;
  Steps: StepsProps;
  TimePicker: TimePickerProps;
  DatePicker: DatePickerProps;
  ColorPicker: ColorPickerProps;
  Slider: SliderProps;
  Rate: RateProps;
  Switch: SwitchProps;
  Radio: RadioProps;
  Checkbox: CheckboxProps;
  Select: SelectProps;
  Upload: UploadProps;
  Image: ImageProps;
  Video: VideoProps;
  Audio: AudioProps;
  CodeBlock: CodeBlockProps;
  Highlight: HighlightProps;
  VirtualList: VirtualListProps;
  InfiniteScroll: InfiniteScrollProps;
  Draggable: DraggableProps;
  Droppable: DroppableProps;
  Responsive: ResponsiveProps;
  I18n: I18nProps;
  Permission: PermissionProps;
  ErrorBoundary: ErrorBoundaryProps;
  Performance: PerformanceProps;
  ABTest: ABTestProps;
  FeatureFlag: FeatureFlagProps;
  Watermark: WatermarkProps;
  Fullscreen: FullscreenProps;
  Print: PrintProps;
};