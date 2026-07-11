import { ForgeAuthSignIn, ForgeAuthSignUp, ForgeUserProfile, ForgeUserAvatar } from '@forge/forge-components';
import { ForgeDataTable, ForgeDataCard, ForgeDataChart, ForgeDataList } from '@forge/forge-components';
import { ForgePaymentButton, ForgePaymentStatus } from '@forge/forge-components';
import { ForgeWalletConnect, ForgeWalletBalance, ForgeNftCard } from '@forge/forge-components';
import { ForgeAiGenerate } from '@forge/forge-components';
import { ForgeFileUpload, ForgeFilePreview } from '@forge/forge-components';
import { ForgeButton, ForgeInput, ForgeBadge, ForgeAvatar, ForgeCard, ForgeText, ForgeLoading } from '@forge/forge-components';
import { registerComponent } from '../plugin/component-registry';

export function loadComponentLibrary() {
  registerComponent('forge-auth-sign-in', {
    name: 'Sign In',
    description: 'Email/password or social sign-in form',
    category: 'auth',
    props: { variant: { type: 'select', label: 'Variant', options: [{ label: 'Default', value: 'default' }, { label: 'Card', value: 'card' }, { label: 'Minimal', value: 'minimal' }] } },
    events: { success: { label: 'On sign in' }, error: { label: 'On error' } },
    supportsChildren: false,
  }, ForgeAuthSignIn);

  registerComponent('forge-auth-sign-up', {
    name: 'Sign Up',
    description: 'User registration form with name, email, and password',
    category: 'auth',
    props: { showName: { type: 'boolean', label: 'Show name field', defaultValue: true } },
    events: { success: { label: 'On sign up' } },
    supportsChildren: false,
  }, ForgeAuthSignUp);

  registerComponent('forge-user-profile', {
    name: 'User Profile',
    description: 'Displays the current user\'s avatar, name, and email',
    category: 'auth',
    props: { showAvatar: { type: 'boolean', label: 'Show avatar', defaultValue: true }, showName: { type: 'boolean', label: 'Show name', defaultValue: true }, layout: { type: 'select', label: 'Layout', options: [{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }] } },
    supportsChildren: false,
  }, ForgeUserProfile);

  registerComponent('forge-user-avatar', {
    name: 'User Avatar',
    description: 'Avatar bound to the current user',
    category: 'auth',
    props: { size: { type: 'select', label: 'Size', options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }] } },
    supportsChildren: false,
  }, ForgeUserAvatar);

  registerComponent('forge-data-table', {
    name: 'Data Table',
    description: 'Display data as a table with rows and columns',
    category: 'data',
    props: { pageSize: { type: 'number', label: 'Page size', defaultValue: 10 } },
    supportsChildren: false,
  }, ForgeDataTable);

  registerComponent('forge-data-card', {
    name: 'Data Card',
    description: 'Display a single data record as a card',
    category: 'data',
    props: {},
    supportsChildren: false,
  }, ForgeDataCard);

  registerComponent('forge-data-list', {
    name: 'Data List',
    description: 'Repeatable list of data items',
    category: 'data',
    props: { template: { type: 'select', label: 'Template', options: [{ label: 'Card', value: 'card' }, { label: 'List', value: 'list' }] } },
    supportsChildren: false,
  }, ForgeDataList);

  registerComponent('forge-data-chart', {
    name: 'Data Chart',
    description: 'Visual chart from data',
    category: 'data',
    props: { chartType: { type: 'select', label: 'Chart type', options: [{ label: 'Bar', value: 'bar' }, { label: 'Line', value: 'line' }, { label: 'Pie', value: 'pie' }] } },
    supportsChildren: false,
  }, ForgeDataChart);

  registerComponent('forge-payment-button', {
    name: 'Payment Button',
    description: 'Trigger a payment through an installed connector',
    category: 'payment',
    props: { amount: { type: 'number', label: 'Amount', defaultValue: 0 }, currency: { type: 'string', label: 'Currency', defaultValue: 'USD' } },
    events: { success: { label: 'Payment success' }, error: { label: 'Payment error' } },
    supportsChildren: false,
  }, ForgePaymentButton);

  registerComponent('forge-payment-status', {
    name: 'Payment Status',
    description: 'Show the status of a transaction',
    category: 'payment',
    props: {},
    supportsChildren: false,
  }, ForgePaymentStatus);

  registerComponent('forge-wallet-connect', {
    name: 'Wallet Connect',
    description: 'Connect to a blockchain wallet',
    category: 'blockchain',
    props: { network: { type: 'select', label: 'Network', options: [{ label: 'Solana', value: 'solana' }, { label: 'Ethereum', value: 'ethereum' }] } },
    events: { wallet_connected: { label: 'Wallet connected' } },
    supportsChildren: false,
  }, ForgeWalletConnect);

  registerComponent('forge-wallet-balance', {
    name: 'Wallet Balance',
    description: 'Display token balance',
    category: 'blockchain',
    props: { token: { type: 'string', label: 'Token', defaultValue: 'SOL' } },
    supportsChildren: false,
  }, ForgeWalletBalance);

  registerComponent('forge-nft-card', {
    name: 'NFT Card',
    description: 'Display an NFT from a collection',
    category: 'blockchain',
    props: {},
    supportsChildren: false,
  }, ForgeNftCard);

  registerComponent('forge-ai-generate', {
    name: 'AI Generate',
    description: 'Generate text with AI',
    category: 'ai',
    props: { model: { type: 'select', label: 'Model', options: [{ label: 'OpenAI', value: 'openai' }] } },
    events: { success: { label: 'Generated' } },
    supportsChildren: false,
  }, ForgeAiGenerate);

  registerComponent('forge-file-upload', {
    name: 'File Upload',
    description: 'Upload files to storage',
    category: 'storage',
    props: { accept: { type: 'string', label: 'Accepted file types', defaultValue: '*' }, multiple: { type: 'boolean', label: 'Allow multiple', defaultValue: false } },
    events: { file_uploaded: { label: 'File uploaded' } },
    supportsChildren: false,
  }, ForgeFileUpload);

  registerComponent('forge-file-preview', {
    name: 'File Preview',
    description: 'Preview an uploaded file',
    category: 'storage',
    props: {},
    supportsChildren: false,
  }, ForgeFilePreview);

  registerComponent('forge-button', {
    name: 'Button',
    description: 'A configurable button',
    category: 'ui',
    props: { variant: { type: 'select', label: 'Variant', options: [{ label: 'Default', value: 'default' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }] }, size: { type: 'select', label: 'Size', options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }] } },
    events: { click: { label: 'On click' } },
    supportsChildren: true,
  }, ForgeButton);

  registerComponent('forge-text', {
    name: 'Text',
    description: 'Data-bound text that updates automatically when source data changes',
    category: 'ui',
    props: { value: { type: 'string', label: 'Text value' }, variant: { type: 'select', label: 'Style', options: [{ label: 'Body', value: 'body' }, { label: 'Heading 1', value: 'h1' }, { label: 'Heading 2', value: 'h2' }, { label: 'Heading 3', value: 'h3' }, { label: 'Caption', value: 'caption' }] } },
    supportsChildren: false,
  }, ForgeText);

  registerComponent('forge-input', {
    name: 'Input',
    description: 'Text input field',
    category: 'ui',
    props: { placeholder: { type: 'string', label: 'Placeholder', defaultValue: 'Enter value...' }, type: { type: 'select', label: 'Type', options: [{ label: 'Text', value: 'text' }, { label: 'Email', value: 'email' }, { label: 'Password', value: 'password' }, { label: 'Number', value: 'number' }] } },
    events: { change: { label: 'On change' } },
    supportsChildren: false,
  }, ForgeInput);

  registerComponent('forge-avatar', {
    name: 'Avatar',
    description: 'User avatar with status indicator',
    category: 'ui',
    props: { size: { type: 'select', label: 'Size', options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }] } },
    supportsChildren: false,
  }, ForgeAvatar);

  registerComponent('forge-badge', {
    name: 'Badge',
    description: 'Status badge with color variants',
    category: 'ui',
    props: { variant: { type: 'select', label: 'Color', options: [{ label: 'Default', value: 'default' }, { label: 'Secondary', value: 'secondary' }, { label: 'Success', value: 'success' }, { label: 'Warning', value: 'warning' }, { label: 'Danger', value: 'danger' }] } },
    supportsChildren: true,
  }, ForgeBadge);

  registerComponent('forge-card', {
    name: 'Card',
    description: 'Content card container',
    category: 'ui',
    props: { variant: { type: 'select', label: 'Variant', options: [{ label: 'Default', value: 'default' }, { label: 'Outline', value: 'outline' }, { label: 'Elevated', value: 'elevated' }] } },
    supportsChildren: true,
  }, ForgeCard);
}
