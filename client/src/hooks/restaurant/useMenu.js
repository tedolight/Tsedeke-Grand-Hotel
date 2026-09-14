import { useState, useEffect } from 'react';
import api from '../../services/api/api.js';
import { unwrapData } from '../../utils/apiHelpers.js';

const MOCK_MENU = [];

const useMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await api.get('/restaurant/items');
        const data = unwrapData(res);
        if (data && data.length > 0) {
          setItems(data);
          setCategories([...new Set(data.map((i) => i.category))]);
        } else {
          setItems([]);
          setCategories([]);
        }
      } catch (err) {
        setError('Failed to load menu items');
        setItems([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return { items, categories, loading, error };
};

export default useMenu;
