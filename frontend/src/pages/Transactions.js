import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import toast from 'react-hot-toast';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      const { data } = await getTransactions(page);
      setTransactions(data.transactions);
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loader"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <p className="transactions-subtitle">View all your buy and sell orders</p>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-transactions">
          <span className="empty-icon">📋</span>
          <h3>No transactions yet</h3>
          <p>Your trading activity will appear here</p>
        </div>
      ) : (
        <>
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="tx-date">{formatDate(tx.createdAt)}</td>
                    <td>
                      <span className={`tx-type ${tx.type === 'BUY' ? 'type-buy' : 'type-sell'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="tx-symbol">{tx.symbol}</td>
                    <td className="tx-company">{tx.companyName}</td>
                    <td>{tx.quantity}</td>
                    <td>${tx.price?.toFixed(2)}</td>
                    <td className="tx-total">${tx.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {pages}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage(page + 1)}
                disabled={page >= pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;