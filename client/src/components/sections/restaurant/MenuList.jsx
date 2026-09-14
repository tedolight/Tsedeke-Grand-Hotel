import { useTranslation } from 'react-i18next';
import React from 'react';
import MenuCard from '../../ui/cards/MenuCard.jsx';

const MenuList = ({ items = [] }) => {
  const { t } = useTranslation();

  if (!items.length) return (
    <div className="text-center py-16 text-white-dim font-montserrat">{t('No menu items found.')}</div>
  {t(');

  return (')}
    <div className="max-w-3xl mx-auto divide-y divide-border-gold/10">
      {items.map((item) => <MenuCard key={item._id || item.name} item={item} />)}
    </div>
  );
};

export default MenuList;
