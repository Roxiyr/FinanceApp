import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';

const root = createRoot(document.getElementById('root'));
root.render(
	<AuthProvider>
		<BudgetProvider>
			<TransactionProvider>
				<App />
			</TransactionProvider>
		</BudgetProvider>
	</AuthProvider>
);
