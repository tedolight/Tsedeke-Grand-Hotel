import React, { useState, useMemo, useEffect } from 'react';
import messagesService from '../../services/messages/messagesService.js';
import api from '../../services/api/api.js';

const mapDbMessage = (msg) => {
  const isRead = msg.status !== 'new';
  const isReplied = msg.status === 'replied';
  const name = msg.name || msg.cName || 'Guest';
  const email = msg.email || msg.cEmail || '';
  const textMsg = msg.message || msg.cMessage || '';
  const createdAt = msg.createdAt || msg.created_at || new Date().toISOString();
  const updatedAt = msg.updatedAt || msg.updated_at || createdAt;
  const strId = String(msg._id || msg.id || '1');
  
  const thread = Array.isArray(msg.thread) && msg.thread.length > 0 ? msg.thread : [
    { sender: name, time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: textMsg, isAdmin: false }
  ];
  
  const timeline = Array.isArray(msg.timeline) && msg.timeline.length > 0 ? msg.timeline : [
    { action: `Message received from ${name}`, time: new Date(createdAt).toLocaleString(), type: 'info' }
  ];

  if ((msg.status === 'read' || msg.status === 'replied') && timeline.length === 1) {
    timeline.unshift({ action: 'Message marked as read', time: new Date(updatedAt).toLocaleString(), type: 'info' });
  }

  return {
    id: strId,
    _id: strId,
    sender: name,
    email,
    avatar: name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CO',
    color: '#2D4A6B',
    subject: msg.subject || msg.cReason || 'No Subject',
    preview: textMsg ? (textMsg.slice(0, 60) + (textMsg.length > 60 ? '...' : '')) : '',
    text: textMsg ? textMsg.split('\n') : [],
    tags: msg.status === 'new' ? ['unread', ...(msg.tags || [])] : (msg.tags || []),
    time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
    unread: msg.status === 'new' || msg.unread === true,
    urgent: msg.priority === 'High',
    folder: msg.folder || 'inbox',
    guest: {
      Phone: msg.phone || '+251 911 000 000',
      Room: 'Not Specified',
      Status: 'Visitor',
      Stays: '1 stay',
    },
    attachments: [],
    priority: msg.priority || 'Medium',
    assignedTo: msg.assignedTo || 'Unassigned',
    department: msg.department || 'Front Desk',
    status: msg.status === 'replied' ? 'Resolved' : (msg.status === 'read' ? 'In Progress' : 'Open'),
    thread,
    timeline
  };
};

// INITIAL DATA FOR MESSAGES (Matching prototype exactly with 8 messages)
const INITIAL_MESSAGES = [];
const QUICK_TEMPLATES = {
  apology: 'Dear Guest,\n\nWe sincerely apologize for this inconvenience. We have escalated this to our team and will resolve it immediately.\n\nBest regards,\nTsedeke Grand Hotel Management',
  escalate: 'Hi Team,\n\nPlease see the complaint from the guest below. Dispatch a technician / coordinator to inspect this immediately and report back.\n\nThanks,\nAdmin Desk',
  roomchange: 'Dear Guest,\n\nWe have arranged a complimentary upgrade/change of room for you. Please coordinate with the Front Desk at your convenience to pick up your new keycards.\n\nBest regards,\nTsedeke Grand Hotel Management',
  compensation: 'Dear Guest,\n\nAs a token of our apologies for the disruption, we have waived the nightly charges for last night and credited a complimentary breakfast to your account.\n\nSincerely,\nTsedeke Grand Hotel Management',
  followup: 'Dear Guest,\n\nFollowing up on our earlier resolution, could you please confirm if everything is working fine now?\n\nBest regards,\nTsedeke Grand Hotel Management'
};

const prototypeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .messages-proto-container {
    --gold: #C9A84C;
    --gold-light: #E8C96A;
    --gold-dim: #8B6914;
    --dark: #0D0D0D;
    --dark2: #161616;
    --dark3: #1E1E1E;
    --dark4: #252525;
    --dark5: #2E2E2E;
    --text: #F5F0E8;
    --text-muted: #9A9080;
    --border: rgba(201,168,76,0.15);
    --border-soft: rgba(201,168,76,0.07);
    --success: #6fcf97;
    --warning: #E8A84C;
    --danger: #ef4444;
    --info: #56CCF2;
    
    font-family: 'DM Sans', sans-serif;
    background: var(--dark);
    color: var(--text);
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .messages-proto-container .font-cormorant {
    font-family: 'Cormorant Garamond', serif !important;
  }
  .messages-proto-container .font-mono {
    font-family: 'Space Mono', monospace !important;
  }
  
  /* Stats strip */
  .messages-proto-container .inbox-stats {
    display: flex;
    gap: 1px;
    background: var(--border);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .messages-proto-container .istat {
    flex: 1;
    background: var(--dark2);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .messages-proto-container .istat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
    font-variant-numeric: lining-nums;
    font-feature-settings: "lnum" 1;
  }
  .messages-proto-container .istat-lbl {
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 1px;
  }
  .messages-proto-container .istat-icon {
    font-size: 0.8rem;
    color: var(--gold);
  }
  
  /* Layout */
  .messages-proto-container .inbox-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .messages-proto-container .inbox-left {
    width: 340px;
    min-width: 340px;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    background: var(--dark2);
  }
  
  .messages-proto-container .inbox-toolbar {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }
  .messages-proto-container .compose-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 0;
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: var(--dark) !important;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    width: 100%;
    transition: all 0.2s;
  }
  .messages-proto-container .compose-btn:hover {
    box-shadow: 0 4px 18px rgba(201,168,76,0.3);
    transform: translateY(-1px);
  }
  
  .messages-proto-container .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--dark3);
    border: 1px solid var(--border);
    padding: 7px 12px;
  }
  .messages-proto-container .search-box input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    width: 100%;
  }
  .messages-proto-container .search-box input::placeholder {
    color: var(--text-muted);
  }
  .messages-proto-container .search-box i {
    color: var(--text-muted);
    font-size: 0.75rem;
  }
  
  .messages-proto-container .folder-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .messages-proto-container .folder-tab {
    flex: 1;
    padding: 9px 4px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.52rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  .messages-proto-container .folder-tab:hover {
    color: var(--text);
  }
  .messages-proto-container .folder-tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }
  .messages-proto-container .folder-tab .tab-count {
    display: inline-block;
    margin-left: 4px;
    background: rgba(239,68,68,0.15);
    color: #ef4444;
    padding: 1px 5px;
    font-size: 0.48rem;
    border-radius: 999px;
    font-family: 'Space Mono', monospace;
  }
  .messages-proto-container .folder-tab.active .tab-count {
    background: rgba(201,168,76,0.15);
    color: var(--gold);
  }
  
  .messages-proto-container .filter-bar {
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-soft);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .messages-proto-container .filter-info {
    font-family: 'Space Mono', monospace;
    font-size: 0.56rem;
    color: var(--text-muted);
  }
  .messages-proto-container .filter-right {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .messages-proto-container .filter-chip {
    padding: 3px 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    font-size: 0.52rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .filter-chip:hover,
  .messages-proto-container .filter-chip.active {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201, 168, 76, 0.05);
  }
  .messages-proto-container .sort-btn {
    color: var(--text-muted);
    font-size: 0.7rem;
    cursor: pointer;
    transition: color 0.2s;
    background: transparent;
    border: none;
    padding: 3px 6px;
  }
  .messages-proto-container .sort-btn:hover {
    color: var(--gold);
  }
  
  .messages-proto-container .msg-list {
    flex: 1;
    overflow-y: auto;
  }
  .messages-proto-container .msg-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-soft);
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
    text-align: left;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    width: 100%;
  }
  .messages-proto-container .msg-row:hover {
    background: rgba(201, 168, 76, 0.03);
  }
  .messages-proto-container .msg-row.active {
    background: rgba(201, 168, 76, 0.06);
  }
  .messages-proto-container .msg-row.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--gold);
  }
  .messages-proto-container .msg-row.unread .msg-sender {
    font-weight: 700;
    color: var(--text);
  }
  .messages-proto-container .msg-row.unread .msg-preview {
    color: var(--text-muted);
  }
  .messages-proto-container .msg-row.unread::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gold);
  }
  
  .messages-proto-container .msg-cb {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(201, 168, 76, 0.25);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.48rem;
    color: transparent;
    flex-shrink: 0;
    margin-top: 3px;
    transition: all 0.15s;
  }
  .messages-proto-container .msg-cb.checked {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--dark);
  }
  .messages-proto-container .msg-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid rgba(201, 168, 76, 0.15);
    color: var(--text);
  }
  .messages-proto-container .msg-body {
    flex: 1;
    min-width: 0;
    text-align: left;
  }
  .messages-proto-container .msg-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
  }
  .messages-proto-container .msg-sender {
    font-size: 0.83rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .messages-proto-container .msg-time {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .messages-proto-container .msg-subject {
    font-size: 0.8rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .messages-proto-container .msg-preview {
    font-size: 0.75rem;
    color: rgba(154, 144, 128, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .messages-proto-container .msg-tags {
    display: flex;
    gap: 4px;
    margin-top: 5px;
    flex-wrap: wrap;
  }
  
  .messages-proto-container .tag {
    padding: 2px 7px;
    font-family: 'Space Mono', monospace;
    font-size: 0.48rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    display: inline-block;
  }
  .messages-proto-container .tag.booking {
    background: rgba(86, 204, 242, 0.08);
    color: #56CCF2;
    border-color: rgba(86, 204, 242, 0.18);
  }
  .messages-proto-container .tag.complaint {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.18);
  }
  .messages-proto-container .tag.enquiry {
    background: rgba(201, 168, 76, 0.08);
    color: var(--gold);
    border-color: rgba(201, 168, 76, 0.2);
  }
  .messages-proto-container .tag.event {
    background: rgba(155, 89, 182, 0.1);
    color: #bb8fce;
    border-color: rgba(155, 89, 182, 0.2);
  }
  .messages-proto-container .tag.restaurant {
    background: rgba(111, 207, 151, 0.08);
    color: #6fcf97;
    border-color: rgba(111, 207, 151, 0.18);
  }
  .messages-proto-container .tag.urgent {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.25);
    font-weight: 700;
  }
  .messages-proto-container .tag.starred {
    background: rgba(201, 168, 76, 0.1);
    color: var(--gold);
    border-color: rgba(201, 168, 76, 0.22);
  }
  
  /* Right Panel Inbox preview */
  .messages-proto-container .inbox-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--dark);
  }
  .messages-proto-container .preview-toolbar {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    background: var(--dark2);
  }
  .messages-proto-container .preview-actions {
    display: flex;
    gap: 6px;
  }
  .messages-proto-container .act-btn {
    width: 30px;
    height: 30px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    transition: all 0.2s;
  }
  .messages-proto-container .act-btn:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  .messages-proto-container .act-btn.danger:hover {
    border-color: var(--danger);
    color: var(--danger);
  }
  
  .messages-proto-container .preview-body {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    text-align: left;
  }
  .messages-proto-container .preview-subject {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 16px;
    line-height: 1.3;
  }
  .messages-proto-container .preview-meta {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-soft);
  }
  .messages-proto-container .preview-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid rgba(201, 168, 76, 0.2);
    color: var(--text);
  }
  .messages-proto-container .preview-from {
    flex: 1;
    min-width: 0;
  }
  .messages-proto-container .preview-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }
  .messages-proto-container .preview-email {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .messages-proto-container .preview-datetime {
    font-family: 'Space Mono', monospace;
    font-size: 0.58rem;
    color: var(--text-muted);
    text-align: right;
    flex-shrink: 0;
  }
  
  .messages-proto-container .preview-tags {
    display: flex;
    gap: 6px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .messages-proto-container .preview-text {
    font-size: 0.88rem;
    color: rgba(245, 240, 232, 0.85);
    line-height: 1.85;
    max-width: 680px;
  }
  .messages-proto-container .preview-text p {
    margin-bottom: 14px;
  }
  .messages-proto-container .preview-text p:last-child {
    margin-bottom: 0;
  }
  
  .messages-proto-container .guest-card {
    margin-top: 24px;
    padding: 16px 18px;
    background: var(--dark3);
    border: 1px solid var(--border);
    max-width: 480px;
    text-align: left;
  }
  .messages-proto-container .guest-card-title {
    font-family: 'Space Mono', monospace;
    font-size: 0.54rem;
    letter-spacing: 0.14em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .messages-proto-container .guest-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
  }
  .messages-proto-container .gf-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .messages-proto-container .gf-val {
    font-size: 0.8rem;
    color: var(--text);
  }
  
  /* Attachments */
  .messages-proto-container .attachments {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-soft);
    text-align: left;
  }
  .messages-proto-container .attachments-title {
    font-family: 'Space Mono', monospace;
    font-size: 0.54rem;
    letter-spacing: 0.14em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .messages-proto-container .attach-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .messages-proto-container .attach-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--dark3);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .messages-proto-container .attach-item:hover {
    border-color: var(--gold);
  }
  .messages-proto-container .attach-icon {
    color: var(--gold);
    font-size: 0.85rem;
  }
  .messages-proto-container .attach-name {
    font-size: 0.78rem;
    color: var(--text);
  }
  .messages-proto-container .attach-size {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    color: var(--text-muted);
  }
  
  /* Reply area */
  .messages-proto-container .reply-area {
    border-top: 1px solid var(--border);
    background: var(--dark2);
    flex-shrink: 0;
    text-align: left;
  }
  .messages-proto-container .reply-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
  }
  .messages-proto-container .reply-tab {
    padding: 9px 18px;
    font-family: 'Space Mono', monospace;
    font-size: 0.56rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  .messages-proto-container .reply-tab:hover {
    color: var(--text);
  }
  .messages-proto-container .reply-tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }
  .messages-proto-container .reply-editor {
    padding: 14px 20px;
  }
  .messages-proto-container .reply-to {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .messages-proto-container .reply-to-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .messages-proto-container .reply-to-val {
    font-size: 0.8rem;
    color: var(--text-muted);
    flex: 1;
    text-align: left;
  }
  .messages-proto-container .reply-textarea {
    width: 100%;
    background: var(--dark3);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    padding: 12px 14px;
    resize: none;
    outline: none;
    line-height: 1.7;
    transition: border-color 0.2s;
    min-height: 90px;
  }
  .messages-proto-container .reply-textarea:focus {
    border-color: var(--gold);
  }
  .messages-proto-container .reply-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    border-top: 1px solid var(--border-soft);
  }
  .messages-proto-container .reply-tools {
    display: flex;
    gap: 4px;
  }
  .messages-proto-container .reply-tool {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.72rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  .messages-proto-container .reply-tool:hover {
    color: var(--gold);
  }
  .messages-proto-container .reply-send {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: var(--dark) !important;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .reply-send:hover {
    box-shadow: 0 4px 18px rgba(201,168,76,0.3);
  }
  
  .messages-proto-container .no-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: var(--text-muted);
    text-align: center;
    padding: 40px;
  }
  .messages-proto-container .no-preview-icon {
    width: 72px;
    height: 72px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    color: rgba(201, 168, 76, 0.3);
    margin: 0 auto;
  }
  .messages-proto-container .no-preview-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    color: var(--text-muted);
  }
  .messages-proto-container .no-preview-sub {
    font-size: 0.78rem;
    color: rgba(154, 144, 128, 0.5);
  }
  
  /* ── DETAIL LAYOUT (View 2) ────────────────── */
  .messages-proto-container .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--dark2);
  }
  .messages-proto-container .action-bar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .messages-proto-container .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }
  .messages-proto-container .back-btn:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  
  .messages-proto-container .msg-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .messages-proto-container .status-unread {
    background: rgba(201,168,76,0.1);
    color: var(--gold);
    border: 1px solid rgba(201,168,76,0.25);
  }
  .messages-proto-container .status-replied {
    background: rgba(111,207,151,0.1);
    color: var(--success);
    border: 1px solid rgba(111,207,151,0.25);
  }
  .messages-proto-container .status-urgent {
    background: rgba(239,68,68,0.1);
    color: var(--danger);
    border: 1px solid rgba(239,68,68,0.25);
  }
  
  .messages-proto-container .act-btn-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .act-btn-label:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  .messages-proto-container .act-btn-label.gold {
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: var(--dark) !important;
    border-color: transparent;
    font-weight: 700;
  }
  .messages-proto-container .act-btn-label.gold:hover {
    box-shadow: 0 4px 18px rgba(201,168,76,0.3);
    transform: translateY(-1px);
  }
  
  .messages-proto-container .detail-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  
  .messages-proto-container .msg-card {
    background: var(--dark2);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .messages-proto-container .msg-card-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .messages-proto-container .msg-subject-line {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    flex: 1;
  }
  
  .messages-proto-container .msg-meta {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border-soft);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .messages-proto-container .sender-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .messages-proto-container .sender-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid rgba(201, 168, 76, 0.2);
    color: var(--text);
  }
  .messages-proto-container .sender-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 3px;
  }
  .messages-proto-container .sender-email {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .messages-proto-container .msg-timestamp {
    text-align: right;
  }
  .messages-proto-container .ts-date {
    font-family: 'Space Mono', monospace;
    font-size: 0.6rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
  }
  .messages-proto-container .ts-time {
    font-family: 'Space Mono', monospace;
    font-size: 0.58rem;
    color: rgba(154, 144, 128, 0.6);
    margin-top: 3px;
  }
  
  .messages-proto-container .msg-body-text {
    padding: 26px 24px;
    font-size: 0.9rem;
    color: rgba(245, 240, 232, 0.85);
    line-height: 1.9;
    border-bottom: 1px solid var(--border-soft);
  }
  .messages-proto-container .msg-body-text p {
    margin-bottom: 16px;
  }
  .messages-proto-container .msg-body-text .highlight {
    background: rgba(201, 168, 76, 0.08);
    border-left: 2px solid var(--gold);
    padding: 10px 14px;
    margin: 14px 0;
    font-size: 0.85rem;
  }
  
  .messages-proto-container .attachments-section {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border-soft);
    text-align: left;
  }
  .messages-proto-container .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.54rem;
    letter-spacing: 0.14em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .messages-proto-container .section-label i {
    color: var(--gold);
  }
  
  .messages-proto-container .thread-section {
    border-top: 1px solid var(--border);
  }
  .messages-proto-container .thread-header {
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(201, 168, 76, 0.02);
  }
  .messages-proto-container .thread-title {
    font-family: 'Space Mono', monospace;
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    color: var(--text-muted);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .messages-proto-container .thread-title i {
    color: var(--gold);
  }
  .messages-proto-container .thread-count {
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    color: var(--gold);
    background: rgba(201, 168, 76, 0.1);
    border: 1px solid rgba(201, 168, 76, 0.2);
    padding: 1px 7px;
    border-radius: 999px;
  }
  
  .messages-proto-container .thread-item {
    padding: 18px 24px;
    border-top: 1px solid var(--border-soft);
    display: flex;
    gap: 14px;
    text-align: left;
  }
  .messages-proto-container .thread-item.from-admin {
    background: rgba(201, 168, 76, 0.02);
  }
  .messages-proto-container .thread-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid rgba(201, 168, 76, 0.15);
    color: var(--text);
  }
  .messages-proto-container .thread-avatar.admin-av {
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: var(--dark) !important;
  }
  .messages-proto-container .thread-body {
    flex: 1;
    min-width: 0;
  }
  .messages-proto-container .thread-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .messages-proto-container .thread-sender {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
  }
  .messages-proto-container .thread-time {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    color: var(--text-muted);
  }
  .messages-proto-container .admin-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.48rem;
    letter-spacing: 0.1em;
    color: var(--gold);
    background: rgba(201, 168, 76, 0.08);
    border: 1px solid rgba(201, 168, 76, 0.18);
    padding: 1px 6px;
    margin-left: 6px;
    text-transform: uppercase;
    display: inline-block;
  }
  
  .messages-proto-container .reply-box {
    padding: 0;
    text-align: left;
  }
  .messages-proto-container .reply-tabs {
    display: flex;
    border-top: 1px solid var(--border);
  }
  .messages-proto-container .reply-tab {
    padding: 10px 20px;
    font-family: 'Space Mono', monospace;
    font-size: 0.56rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    border-top: 2px solid transparent;
    background: transparent;
    border-left: none;
    border-right: none;
  }
  .messages-proto-container .reply-tab:hover {
    color: var(--text);
  }
  .messages-proto-container .reply-tab.active {
    color: var(--gold);
    border-top-color: var(--gold);
  }
  .messages-proto-container .reply-editor {
    padding: 16px 24px;
  }
  .messages-proto-container .reply-to-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-soft);
  }
  .messages-proto-container .reply-to-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    flex-shrink: 0;
    width: 30px;
  }
  .messages-proto-container .reply-to-val {
    font-size: 0.82rem;
    color: var(--text-muted);
    flex: 1;
  }
  .messages-proto-container .reply-cc {
    font-size: 0.75rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
  }
  .messages-proto-container .reply-cc:hover {
    color: var(--gold);
  }
  .messages-proto-container .reply-textarea {
    width: 100%;
    background: var(--dark3);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.87rem;
    padding: 14px 16px;
    resize: none;
    outline: none;
    line-height: 1.8;
    transition: border-color 0.2s;
    min-height: 120px;
  }
  .messages-proto-container .reply-textarea:focus {
    border-color: var(--gold);
  }
  
  .messages-proto-container .quick-templates {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .messages-proto-container .qt-chip {
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .qt-chip:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201, 168, 76, 0.05);
  }
  
  .messages-proto-container .reply-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 1px solid var(--border-soft);
  }
  .messages-proto-container .reply-tools {
    display: flex;
    gap: 4px;
  }
  .messages-proto-container .reply-tool {
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  .messages-proto-container .reply-tool:hover {
    color: var(--gold);
  }
  .messages-proto-container .draft-btn {
    padding: 8px 14px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .draft-btn:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  .messages-proto-container .send-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: var(--dark) !important;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .send-btn:hover {
    box-shadow: 0 4px 18px rgba(201,168,76,0.3);
    transform: translateY(-1px);
  }
  
  /* Right side panels */
  .messages-proto-container .side-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }
  .messages-proto-container .info-card {
    background: var(--dark2);
    border: 1px solid var(--border);
    text-align: left;
  }
  .messages-proto-container .info-card-head {
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .messages-proto-container .info-card-title {
    font-family: 'Space Mono', monospace;
    font-size: 0.54rem;
    letter-spacing: 0.14em;
    color: var(--gold);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .messages-proto-container .info-card-action {
    font-size: 0.7rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
  }
  .messages-proto-container .info-card-action:hover {
    color: var(--gold);
  }
  .messages-proto-container .info-card-body {
    padding: 16px;
  }
  
  /* Guest avatar */
  .messages-proto-container .guest-avatar-big {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    border: 2px solid rgba(201,168,76,0.2);
    margin: 0 auto 12px;
    color: var(--text);
  }
  .messages-proto-container .guest-name-big {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
    text-align: center;
    margin-bottom: 3px;
  }
  .messages-proto-container .guest-email-small {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 14px;
  }
  .messages-proto-container .guest-stats-row {
    display: grid;
    grid-template-columns: 2fr 2fr;
    gap: 1px;
    background: var(--border);
    margin-bottom: 14px;
  }
  .messages-proto-container .gstat {
    background: var(--dark3);
    padding: 9px 10px;
    text-align: center;
  }
  .messages-proto-container .gstat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
    font-variant-numeric: lining-nums;
    font-feature-settings: "lnum" 1;
  }
  .messages-proto-container .gstat-lbl {
    font-family: 'Space Mono', monospace;
    font-size: 0.48rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .messages-proto-container .guest-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .messages-proto-container .gf-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-soft);
  }
  .messages-proto-container .gf-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .messages-proto-container .gf-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .messages-proto-container .gf-val {
    font-size: 0.82rem;
    color: var(--text);
  }
  .messages-proto-container .gf-val a {
    color: var(--gold);
    text-decoration: none;
  }
  .messages-proto-container .gf-val a:hover {
    text-decoration: underline;
  }
  
  /* Booking chip */
  .messages-proto-container .booking-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--dark3);
    border: 1px solid var(--border);
    margin-bottom: 8px;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .messages-proto-container .booking-chip:hover {
    border-color: var(--gold);
  }
  .messages-proto-container .booking-chip:last-child {
    margin-bottom: 0;
  }
  .messages-proto-container .bk-icon {
    width: 32px;
    height: 32px;
    background: rgba(201,168,76,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: var(--gold);
    flex-shrink: 0;
  }
  .messages-proto-container .bk-info {
    flex: 1;
    min-width: 0;
    text-align: left;
  }
  .messages-proto-container .bk-ref {
    font-family: 'Space Mono', monospace;
    font-size: 0.58rem;
    color: var(--gold);
    margin-bottom: 2px;
  }
  .messages-proto-container .bk-desc {
    font-size: 0.78rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .messages-proto-container .bk-date {
    font-family: 'Space Mono', monospace;
    font-size: 0.52rem;
    color: var(--text-muted);
  }
  .messages-proto-container .bk-status {
    font-family: 'Space Mono', monospace;
    font-size: 0.48rem;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .messages-proto-container .bk-status.confirmed {
    background: rgba(111,207,151,0.1);
    color: var(--success);
  }
  .messages-proto-container .bk-status.pending {
    background: rgba(232,168,76,0.1);
    color: var(--warning);
  }
  
  /* Assign properties */
  .messages-proto-container .assign-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-soft);
  }
  .messages-proto-container .assign-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .messages-proto-container .assign-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.52rem;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .messages-proto-container .assign-val {
    font-size: 0.8rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .messages-proto-container .assign-ava {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.42rem;
    color: var(--dark) !important;
    font-weight: 700;
  }
  .messages-proto-container .assign-change {
    font-size: 0.68rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
  }
  .messages-proto-container .assign-change:hover {
    color: var(--gold);
  }
  
  .messages-proto-container .priority-row {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  .messages-proto-container .prio-chip {
    flex: 1;
    padding: 6px 4px;
    text-align: center;
    border: 1px solid var(--border);
    background: transparent;
    font-family: 'Space Mono', monospace;
    font-size: 0.5rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .prio-chip:hover,
  .messages-proto-container .prio-chip.active {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201, 168, 76, 0.06);
  }
  .messages-proto-container .prio-chip.high.active,
  .messages-proto-container .prio-chip.high:hover {
    border-color: var(--danger);
    color: var(--danger);
    background: rgba(239, 68, 68, 0.06);
  }
  .messages-proto-container .prio-chip.medium.active,
  .messages-proto-container .prio-chip.medium:hover {
    border-color: var(--warning);
    color: var(--warning);
    background: rgba(232, 168, 76, 0.06);
  }
  
  /* Quick actions */
  .messages-proto-container .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .messages-proto-container .qa-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--dark3);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.8rem;
    color: var(--text-muted);
    width: 100%;
  }
  .messages-proto-container .qa-btn:hover {
    border-color: var(--gold);
    color: var(--text);
    background: rgba(201, 168, 76, 0.04);
  }
  .messages-proto-container .qa-btn i {
    width: 16px;
    text-align: center;
    color: var(--gold);
    font-size: 0.8rem;
  }
  .messages-proto-container .qa-btn.danger:hover {
    border-color: var(--danger);
    color: var(--danger);
  }
  .messages-proto-container .qa-btn.danger i {
    color: var(--danger);
  }
  
  /* Audit timeline */
  .messages-proto-container .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .messages-proto-container .tl-item {
    display: flex;
    gap: 10px;
    padding-bottom: 14px;
    position: relative;
    text-align: left;
  }
  .messages-proto-container .tl-item:last-child {
    padding-bottom: 0;
  }
  .messages-proto-container .tl-item::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 22px;
    bottom: 0;
    width: 1px;
    background: var(--border-soft);
  }
  .messages-proto-container .tl-item:last-child::before {
    display: none;
  }
  .messages-proto-container .tl-dot {
    width: 23px;
    height: 23px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--dark3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.55rem;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .messages-proto-container .tl-dot.gold {
    border-color: rgba(201, 168, 76, 0.4);
    background: rgba(201, 168, 76, 0.08);
    color: var(--gold);
  }
  .messages-proto-container .tl-dot.red {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.06);
    color: var(--danger);
  }
  .messages-proto-container .tl-dot.green {
    border-color: rgba(111, 207, 151, 0.3);
    background: rgba(111, 207, 151, 0.06);
    color: var(--success);
  }
  .messages-proto-container .tl-dot.muted {
    color: var(--text-muted);
  }
  .messages-proto-container .tl-content {
    flex: 1;
    min-width: 0;
  }
  .messages-proto-container .tl-action {
    font-size: 0.8rem;
    color: var(--text);
    margin-bottom: 2px;
    line-height: 1.4;
  }
  .messages-proto-container .tl-time {
    font-family: 'Space Mono', monospace;
    font-size: 0.52rem;
    color: var(--text-muted);
  }
  
  /* Compose Modal */
  .messages-proto-container .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.78);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0 28px 28px;
  }
  .messages-proto-container .compose-modal {
    background: var(--dark2);
    border: 1px solid var(--border);
    width: 520px;
    max-width: 95vw;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    text-align: left;
  }
  .messages-proto-container .compose-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--dark3);
  }
  .messages-proto-container .compose-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
  }
  .messages-proto-container .compose-close {
    width: 26px;
    height: 26px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.72rem;
    transition: all 0.2s;
  }
  .messages-proto-container .compose-close:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  .messages-proto-container .compose-fields {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 0;
    border-bottom: 1px solid var(--border);
  }
  .messages-proto-container .cfield {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border-soft);
    padding: 8px 0;
  }
  .messages-proto-container .cfield:last-child {
    border-bottom: none;
  }
  .messages-proto-container .cfield-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    width: 36px;
    flex-shrink: 0;
  }
  .messages-proto-container .cfield-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem;
  }
  .messages-proto-container .cfield-input::placeholder {
    color: var(--text-muted);
  }
  .messages-proto-container .compose-body {
    padding: 0 18px;
  }
  .messages-proto-container .compose-textarea {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    resize: none;
    line-height: 1.7;
    min-height: 140px;
    padding: 14px 0;
  }
  .messages-proto-container .compose-foot {
    padding: 10px 18px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .messages-proto-container .compose-tools {
    display: flex;
    gap: 4px;
  }
  .messages-proto-container .compose-tool {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.72rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  .messages-proto-container .compose-tool:hover {
    color: var(--gold);
  }
  .messages-proto-container .draft-btn-modal {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 7px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .messages-proto-container .draft-btn-modal:hover {
    border-color: var(--gold);
    color: var(--text);
  }
  
  /* Toast styles overrides */
  .messages-proto-container .toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: var(--dark2);
    border: 1px solid var(--border);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.82rem;
    color: var(--text);
    z-index: 9999;
    opacity: 0;
    transition: all 0.3s;
    pointer-events: none;
    white-space: nowrap;
  }
  .messages-proto-container .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
  .messages-proto-container .toast-line {
    width: 3px;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--gold);
  }
`;

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFolder, setActiveFolder] = useState('inbox'); // 'inbox', 'sent', 'starred', 'archive', 'trash'
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'urgent'
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  
  // Compose modal states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [compTo, setCompTo] = useState('');
  const [compSubject, setCompSubject] = useState('');
  const [compContent, setCompContent] = useState('');
  
  // Selection / Detail focus
  const [focusedMessageId, setFocusedMessageId] = useState(null);
  const [isFullViewMode, setIsFullViewMode] = useState(false);

  // Reply box inputs
  const [replyText, setReplyText] = useState('');
  const [replyTab, setReplyTab] = useState('Reply'); // 'Reply', 'Forward', 'Internal Note'

  // Toast Helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await messagesService.getMessages();
        const items = res.data || res || [];
        const mapped = items.map(mapDbMessage);
        setMessages(mapped);
      } catch (err) {
        console.error('Error loading messages:', err);
        showToast('Error loading messages from server');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter(m => m.unread).length;
    const urgent = messages.filter(m => m.urgent).length;
    const replied = messages.filter(m => m.status === 'Resolved').length;
    const archived = messages.filter(m => m.folder === 'archive').length;
    
    return { total, unread, urgent, replied, archived };
  }, [messages]);

  // Filter messages based on Folder, Filter Type, Search query
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Folder logic
      if (activeFolder === 'starred') {
        if (m.folder === 'trash') return false; // Starred doesn't show deleted
        const hasStarredTag = m.tags.includes('starred');
        if (!hasStarredTag) return false;
      } else {
        if (m.folder !== activeFolder) return false;
      }

      // Filter type (All, Unread, Urgent)
      if (filterType === 'unread' && !m.unread) return false;
      if (filterType === 'urgent' && !m.urgent) return false;

      // Search query
      const matchesSearch = (m.sender || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (m.preview || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [messages, activeFolder, filterType, searchQuery]);

  // Get current focused message object
  const focusedMessage = useMemo(() => {
    return messages.find(m => m.id === focusedMessageId) || null;
  }, [messages, focusedMessageId]);

  // Toggle row checkbox
  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Actions for focused message
  const handleFocusMessage = async (id) => {
    setFocusedMessageId(id);
    try {
      const msgObj = messages.find(m => m.id === id);
      if (msgObj && msgObj.unread) {
        await messagesService.markAsRead(id);
        setMessages(prev => prev.map(m => 
          m.id === id ? { ...m, unread: false, status: 'In Progress', tags: m.tags.filter(t => t !== 'unread') } : m
        ));
      }
      const repliesDataRes = await api.get(`/messages/${id}/replies`);
      const backendReplies = repliesDataRes.data.data || [];
      const mappedReplies = backendReplies.map(r => ({
        sender: r.isCustomerReply ? msgObj.sender : (r.user?.name || 'Admin User'),
        time: new Date(r.createdAt).toLocaleString(),
        text: r.message,
        isAdmin: !r.isCustomerReply
      }));

      setMessages(prev => prev.map(m => {
        if (m.id === id) {
          const originalMsgThread = m.thread[0]; // The original message is always the first one
          return {
            ...m,
            thread: [originalMsgThread, ...mappedReplies]
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Error loading replies or marking read:', err);
    }
  };

  const handleActionFocused = async (action) => {
    if (!focusedMessageId) return;

    if (action === 'starred') {
      try {
        const msg = messages.find(m => m.id === focusedMessageId);
        const nextTags = msg.tags.includes('starred') 
          ? msg.tags.filter(t => t !== 'starred') 
          : [...msg.tags, 'starred'];
        
        await messagesService.updateAttributes(focusedMessageId, { tags: nextTags.filter(t => t !== 'unread') });
        
        setMessages(prev => prev.map(m => {
          if (m.id === focusedMessageId) {
            showToast(nextTags.includes('starred') ? 'Message starred' : 'Message unstarred');
            return { ...m, tags: nextTags };
          }
          return m;
        }));
      } catch (err) {
        showToast('Failed to update message');
      }
    } else if (action === 'archived') {
      try {
        await messagesService.updateAttributes(focusedMessageId, { folder: 'archive' });
        setMessages(prev => prev.map(m => {
          if (m.id === focusedMessageId) {
            showToast('Message archived');
            return { ...m, folder: 'archive' };
          }
          return m;
        }));
        setFocusedMessageId(null);
        setIsFullViewMode(false);
      } catch (err) {
        showToast('Failed to archive message');
      }
    } else if (action === 'deleted') {
      const msg = messages.find(m => m.id === focusedMessageId);
      if (msg.folder === 'trash') {
        if (window.confirm('Delete message permanently?')) {
          try {
            await api.delete(`/contact/${focusedMessageId}`);
            setMessages(prev => prev.filter(m => m.id !== focusedMessageId));
            showToast('Message deleted successfully');
            setFocusedMessageId(null);
            setIsFullViewMode(false);
          } catch (err) {
            console.error(err);
            showToast('Failed to delete message');
          }
        }
      } else {
        try {
          await messagesService.updateAttributes(focusedMessageId, { folder: 'trash' });
          setMessages(prev => prev.map(m => {
            if (m.id === focusedMessageId) {
              showToast('Message moved to trash');
              return { ...m, folder: 'trash' };
            }
            return m;
          }));
          setFocusedMessageId(null);
          setIsFullViewMode(false);
        } catch (err) {
          showToast('Failed to move to trash');
        }
      }
    } else if (action === 'unread') {
      try {
        await messagesService.updateAttributes(focusedMessageId, { status: 'new' });
        setMessages(prev => prev.map(m => {
          if (m.id === focusedMessageId) {
            showToast('Marked as unread');
            const newTags = m.tags.includes('unread') ? m.tags : ['unread', ...m.tags];
            return { ...m, unread: true, status: 'new', tags: newTags };
          }
          return m;
        }));
        setFocusedMessageId(null);
        setIsFullViewMode(false);
      } catch (err) {
        showToast('Failed to mark as unread');
      }
    }
  };

  const handleUpdateProperties = async (field, val) => {
    try {
      const updatePayload = {};
      if (field === 'priority') updatePayload.priority = val;
      if (field === 'status') updatePayload.status = val;
      if (field === 'assignedTo') updatePayload.assignedTo = val;
      if (field === 'addTag') {
        const msg = messages.find(m => m.id === focusedMessageId);
        updatePayload.tags = [...msg.tags, val];
      }
      
      await messagesService.updateAttributes(focusedMessageId, updatePayload);
      
      setMessages(prev => prev.map(m => {
        if (m.id === focusedMessageId) {
          let updated = { ...m };
          if (field === 'priority') {
            updated.priority = val;
            updated.urgent = val === 'High';
            updated.timeline = [{ action: `Priority changed to ${val}`, time: 'Just Now', type: 'gold' }, ...updated.timeline];
          } else if (field === 'status') {
            updated.status = val;
            updated.timeline = [{ action: `Status updated to ${val}`, time: 'Just Now', type: 'green' }, ...updated.timeline];
          } else if (field === 'assignedTo') {
            updated.assignedTo = val;
            updated.timeline = [{ action: `Assigned to ${val}`, time: 'Just Now', type: 'gold' }, ...updated.timeline];
          } else if (field === 'addTag') {
            if (!updated.tags.includes(val)) {
              updated.tags = [...updated.tags, val];
              updated.timeline = [{ action: `Added tag: ${val}`, time: 'Just Now', type: 'info' }, ...updated.timeline];
            }
          }
          return updated;
        }
        return m;
      }));
      showToast(`Updated ${field}`);
    } catch (err) {
      showToast(`Failed to update ${field}`);
    }
  };

  // Reply handlers
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await messagesService.replyToMessage(focusedMessageId, { message: replyText });
      
      setMessages(prev => prev.map(m => {
        if (m.id === focusedMessageId) {
          const newReply = {
            sender: 'Ahmed Suleiman',
            time: 'Just Now',
            text: replyText,
            isAdmin: replyTab === 'Internal Note' ? 'note' : true
          };
          const updatedThread = [...m.thread, newReply];
          const updatedTimeline = [
            { action: replyTab === 'Internal Note' ? 'Internal note added' : 'Staff reply sent', time: 'Just now', type: replyTab === 'Internal Note' ? 'gold' : 'green' },
            ...m.timeline
          ];
          return {
            ...m,
            status: replyTab === 'Internal Note' ? m.status : 'Resolved',
            thread: updatedThread,
            timeline: updatedTimeline
          };
        }
        return m;
      }));

      showToast(replyTab === 'Internal Note' ? 'Internal note logged' : 'Reply sent successfully');
      setReplyText('');
    } catch (err) {
      console.error(err);
      showToast('Failed to send reply');
    }
  };

  const handleInsertTemplate = (type) => {
    const text = QUICK_TEMPLATES[type] || '';
    setReplyText(prev => prev ? prev + '\n' + text : text);
  };

  // Compose Modal Handlers
  const handleSendNewMessage = async (e) => {
    e.preventDefault();
    if (!compTo || !compSubject || !compContent) {
      showToast('Please fill out recipient, subject and message body');
      return;
    }

    try {
      const res = await api.post('/contact', {
        name: compTo.split('@')[0] || 'Unknown',
        email: compTo,
        subject: compSubject,
        message: compContent,
        folder: 'sent'
      });

      const dbMsg = res.data.data || res.data;
      const newMsg = mapDbMessage(dbMsg);

      setMessages(prev => [newMsg, ...prev]);
      showToast('Message sent successfully');
      setShowComposeModal(false);
      
      setCompTo('');
      setCompSubject('');
      setCompContent('');
    } catch (err) {
      console.error(err);
      showToast('Failed to create query');
    }
  };


  return (
    <div className="messages-proto-container" style={{ height: 'calc(100vh - 128px)', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.15)', overflow: 'hidden', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: prototypeStyles }} />

      {/* Toast notifications */}
      {toasts.map(toast => (
        <div key={toast.id} className="toast show" style={{ pointerEvents: 'auto', bottom: '28px', opacity: 1, transform: 'translateX(-50%) translateY(0)' }}>
          <div className="toast-line"></div>
          <i className="fas fa-check-circle" style={{ color: 'var(--gold)' }}></i>
          <span>{toast.message}</span>
        </div>
      ))}

      {!isFullViewMode ? (
        /* ========================================================
            VIEW 1: INBOX DASHBOARD (Folders, List, Preview)
           ======================================================== */
        <>
          {/* Stats strip */}
          <div className="inbox-stats">
            <div className="istat">
              <i className="istat-icon fas fa-inbox"></i>
              <div>
                <div className="istat-val">{stats.total}</div>
                <div className="istat-lbl">Total</div>
              </div>
            </div>
            <div className="istat">
              <i className="istat-icon fas fa-envelope"></i>
              <div>
                <div className="istat-val" style={{ color: 'var(--gold)' }}>{stats.unread}</div>
                <div className="istat-lbl">Unread</div>
              </div>
            </div>
            <div className="istat">
              <i className="istat-icon fas fa-reply"></i>
              <div>
                <div className="istat-val">{stats.replied}</div>
                <div className="istat-lbl">Replied</div>
              </div>
            </div>
            <div className="istat">
              <i className="istat-icon fas fa-exclamation-circle"></i>
              <div>
                <div className="istat-val" style={{ color: 'var(--danger)' }}>{stats.urgent}</div>
                <div className="istat-lbl">Urgent</div>
              </div>
            </div>
            <div className="istat">
              <i className="istat-icon fas fa-archive"></i>
              <div>
                <div className="istat-val">{stats.archived}</div>
                <div className="istat-lbl">Archived</div>
              </div>
            </div>
          </div>

          <div className="inbox-layout">
            {/* LEFT: List panel */}
            <div className="inbox-left">
              <div className="inbox-toolbar">
                <button className="compose-btn" onClick={() => setShowComposeModal(true)}>
                  <i className="fas fa-pen"></i> Compose New Message
                </button>
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search messages…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="folder-tabs">
                {[
                  { key: 'inbox', label: 'Inbox', count: stats.unread },
                  { key: 'sent', label: 'Sent' },
                  { key: 'starred', label: 'Starred' },
                  { key: 'archive', label: 'Archive' },
                  { key: 'trash', label: 'Trash' }
                ].map(f => (
                  <div
                    key={f.key}
                    className={`folder-tab ${activeFolder === f.key ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFolder(f.key);
                      setFocusedMessageId(null);
                    }}
                  >
                    {f.label}
                    {f.count > 0 && <span className="tab-count">{f.count}</span>}
                  </div>
                ))}
              </div>

              <div className="filter-bar">
                <span className="filter-info">{filteredMessages.length} messages</span>
                <div className="filter-right">
                  <button
                    className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-chip ${filterType === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilterType('unread')}
                  >
                    Unread
                  </button>
                  <button
                    className={`filter-chip ${filterType === 'urgent' ? 'active' : ''}`}
                    onClick={() => setFilterType('urgent')}
                  >
                    Urgent
                  </button>
                  <button className="sort-btn" title="Sort">
                    <i className="fas fa-sort-amount-down"></i>
                  </button>
                </div>
              </div>

              <div className="msg-list">
                {loading ? (
                  <div className="empty-state">
                    <div className="empty-icon"><i className="fas fa-spinner fa-spin" style={{ color: 'var(--gold)' }}></i></div>
                    <div className="empty-title">Loading Messages</div>
                    <div className="empty-sub">Fetching latest contact queries from server...</div>
                  </div>
                ) : (
                  <>
                    {filteredMessages.map(m => {
                      const isSelected = selectedIds.includes(m.id);
                      const isFocused = focusedMessageId === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`msg-row ${m.unread ? 'unread' : ''} ${isFocused ? 'active' : ''}`}
                          onClick={() => handleFocusMessage(m.id)}
                        >
                          <div
                            className={`msg-cb ${isSelected ? 'checked' : ''}`}
                            onClick={(e) => handleToggleSelect(m.id, e)}
                          >
                            <i className="fas fa-check"></i>
                          </div>
                          <div className="msg-avatar" style={{ backgroundColor: m.color || '#2d4a6b' }}>
                            {m.avatar}
                          </div>
                          <div className="msg-body">
                            <div className="msg-top">
                              <span className="msg-sender">{m.sender}</span>
                              <span className="msg-time">{m.time || m.date}</span>
                            </div>
                            <div className="msg-subject">{m.subject}</div>
                            <div className="msg-preview">{m.preview}</div>
                            <div className="msg-tags">
                              {m.tags.map(t => (
                                <span key={t} className={`tag ${t}`}>{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredMessages.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon"><i className="fas fa-inbox"></i></div>
                        <div className="empty-title">No messages here</div>
                        <div className="empty-sub">Nothing to show in this folder.</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Preview panel */}
            <div className="inbox-right">
              {!focusedMessage ? (
                <div className="no-preview">
                  <div className="no-preview-icon"><i className="fas fa-comment-alt"></i></div>
                  <div className="no-preview-title">Select a message</div>
                  <div className="no-preview-sub">Choose a conversation from the list to read it here</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="preview-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="preview-actions">
                        <button className="act-btn" title="Reply" onClick={() => setReplyTab('Reply')}><i className="fas fa-reply"></i></button>
                        <button className="act-btn" title="Forward" onClick={() => setReplyTab('Forward')}><i className="fas fa-share"></i></button>
                        <button
                          className={`act-btn ${focusedMessage.tags.includes('starred') ? 'active' : ''}`}
                          title="Star"
                          onClick={() => handleActionFocused('starred')}
                          style={{ color: focusedMessage.tags.includes('starred') ? 'var(--gold)' : '' }}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                        <button className="act-btn" title="Archive" onClick={() => handleActionFocused('archived')}><i className="fas fa-archive"></i></button>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {focusedMessage.tags.map(t => (
                          <span key={t} className={`tag ${t}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="preview-actions">
                      <button className="act-btn" title="Open Full" onClick={() => setIsFullViewMode(true)}><i className="fas fa-expand-alt"></i></button>
                      <button className="act-btn" title="Mark Unread" onClick={() => handleActionFocused('unread')}><i className="fas fa-circle"></i></button>
                      <button className="act-btn danger" title="Delete" onClick={() => handleActionFocused('deleted')}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>

                  <div className="preview-body">
                    <div className="preview-subject">{focusedMessage.subject}</div>
                    <div className="preview-meta">
                      <div className="preview-avatar" style={{ backgroundColor: focusedMessage.color }}>{focusedMessage.avatar}</div>
                      <div className="preview-from">
                        <div className="preview-name">{focusedMessage.sender}</div>
                        <div className="preview-email">{focusedMessage.email}</div>
                      </div>
                      <div className="preview-datetime">
                        {focusedMessage.date}
                        <br />
                        {focusedMessage.time}
                      </div>
                    </div>
                    <div className="preview-tags">
                      {focusedMessage.tags.map(t => (
                        <span key={t} className={`tag ${t}`}>{t}</span>
                      ))}
                    </div>
                    <div className="preview-text">
                      {focusedMessage.text.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>

                    {focusedMessage.guest && Object.keys(focusedMessage.guest).length > 0 && (
                      <div className="guest-card">
                        <div className="guest-card-title"><i className="fas fa-user" style={{ marginRight: '6px' }}></i>Sender Information</div>
                        <div className="guest-fields">
                          {Object.entries(focusedMessage.guest).map(([k, v]) => (
                            <div key={k}>
                              <div className="gf-label">{k}</div>
                              <div className="gf-val">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {focusedMessage.attachments && focusedMessage.attachments.length > 0 && (
                      <div className="attachments">
                        <div className="attachments-title"><i className="fas fa-paperclip" style={{ marginRight: '6px' }}></i>Attachments</div>
                        <div className="attach-list">
                          {focusedMessage.attachments.map((a, i) => (
                            <div key={i} className="attach-item" onClick={() => showToast(`Downloading ${a.name}...`)}>
                              <i className={`fas ${a.icon} attach-icon`}></i>
                              <div>
                                <div className="attach-name">{a.name}</div>
                                <div className="attach-size">{a.size}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="reply-area">
                    <div className="reply-tabs">
                      {['Reply', 'Forward', 'Internal Note'].map(tab => (
                        <div
                          key={tab}
                          className={`reply-tab ${replyTab === tab ? 'active' : ''}`}
                          onClick={() => setReplyTab(tab)}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    <div className="reply-editor">
                      <div className="reply-to">
                        <span className="reply-to-label">To:</span>
                        <span className="reply-to-val">
                          {replyTab === 'Internal Note'
                            ? 'Staff members (Internal log)'
                            : `${focusedMessage.sender} <${focusedMessage.email}>`}
                        </span>
                      </div>
                      <textarea
                        className="reply-textarea"
                        placeholder={replyTab === 'Internal Note' ? 'Type internal note…' : 'Type your reply…'}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="reply-footer">
                      <div className="reply-tools">
                        <button className="reply-tool" title="Attach file" onClick={() => showToast('Attach file')}><i className="fas fa-paperclip"></i></button>
                        <button className="reply-tool" title="Bold"><i className="fas fa-bold"></i></button>
                        <button className="reply-tool" title="Template" onClick={() => handleInsertTemplate('apology')}><i className="fas fa-file-alt"></i></button>
                        <button className="reply-tool" title="Emoji"><i className="fas fa-smile"></i></button>
                      </div>
                      <button className="reply-send" onClick={handleSendReply}>
                        <i className="fas fa-paper-plane"></i> {replyTab === 'Internal Note' ? 'Log Note' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================
            VIEW 2: FULL DETAILS VIEW SCREEN (admin-MessageDetail.html)
           ======================================================== */
        focusedMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* ACTION BAR */}
            <div className="action-bar">
              <div className="action-bar-left">
                <button className="back-btn" onClick={() => setIsFullViewMode(false)}>
                  <i className="fas fa-arrow-left"></i> Back to Inbox
                </button>
                {focusedMessage.urgent && <span className="msg-status-badge status-urgent"><i className="fas fa-exclamation-circle"></i> Urgent</span>}
                {focusedMessage.unread && <span className="msg-status-badge status-unread"><i className="fas fa-envelope"></i> Unread</span>}
              </div>
              <div className="action-bar-right">
                <button className="act-btn" title="Previous message" onClick={() => {
                  const idx = messages.findIndex(x => x.id === focusedMessageId);
                  if (idx > 0) handleFocusMessage(messages[idx - 1].id);
                }}><i className="fas fa-chevron-up"></i></button>
                <button className="act-btn" title="Next message" onClick={() => {
                  const idx = messages.findIndex(x => x.id === focusedMessageId);
                  if (idx < messages.length - 1) handleFocusMessage(messages[idx + 1].id);
                }}><i className="fas fa-chevron-down"></i></button>
                <button className="act-btn" title="Star message" onClick={() => handleActionFocused('starred')} style={{ color: focusedMessage.tags.includes('starred') ? 'var(--gold)' : '' }}>
                  <i className="fas fa-star"></i>
                </button>
                <button className="act-btn" title="Archive" onClick={() => handleActionFocused('archived')}><i className="fas fa-archive"></i></button>
                <button className="act-btn" title="Print" onClick={() => window.print()}><i className="fas fa-print"></i></button>
                <button className="act-btn danger" title="Delete message" onClick={() => handleActionFocused('deleted')}><i className="fas fa-trash"></i></button>
                <button className="act-btn-label gold" onClick={() => document.getElementById('replyBox')?.scrollIntoView({ behavior: 'smooth' })}>
                  <i className="fas fa-reply"></i> Reply
                </button>
              </div>
            </div>

            {/* TWO COLUMN LAYOUT */}
            <div className="detail-layout" style={{ height: 'calc(100% - 60px)', overflowY: 'auto', padding: '24px' }}>
              {/* LEFT: Full message + thread + reply */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Message Card */}
                <div className="msg-card">
                  <div className="msg-card-header">
                    <div>
                      <div className="msg-subject-line">{focusedMessage.subject}</div>
                      <div className="msg-tags-wrap">
                        {focusedMessage.tags.map(t => (
                          <span key={t} className={`tag ${t}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="msg-meta">
                    <div className="sender-row">
                      <div className="sender-avatar" style={{ backgroundColor: focusedMessage.color }}>{focusedMessage.avatar}</div>
                      <div className="sender-info">
                        <div className="sender-name">{focusedMessage.sender}</div>
                        <div className="sender-email">{focusedMessage.email}</div>
                      </div>
                    </div>
                    <div className="msg-timestamp">
                      <div className="ts-date">{focusedMessage.date}</div>
                      <div className="ts-time">{focusedMessage.time}</div>
                    </div>
                  </div>

                  <div className="msg-body-text">
                    {focusedMessage.text.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {focusedMessage.urgent && (
                      <div className="highlight">
                        <strong>Impact:</strong> We have been unable to sleep comfortably due to the heat. The temperature in the room reached an unacceptable level overnight.
                      </div>
                    )}
                  </div>

                  {focusedMessage.attachments && focusedMessage.attachments.length > 0 && (
                    <div className="attachments-section">
                      <div className="section-label"><i className="fas fa-paperclip"></i> Attachments ({focusedMessage.attachments.length})</div>
                      <div className="attach-list">
                        {focusedMessage.attachments.map((a, i) => (
                          <div key={i} className="attach-item" onClick={() => showToast(`Downloading ${a.name}...`)}>
                            <i className={`fas ${a.icon} attach-icon`}></i>
                            <div className="attach-info">
                              <div className="attach-name">{a.name}</div>
                              <div className="attach-size">{a.size}</div>
                            </div>
                            <i className="fas fa-download attach-dl"></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Thread replies */}
                  {focusedMessage.thread && focusedMessage.thread.length > 0 && (
                    <div className="thread-section">
                      <div className="thread-header">
                        <div className="thread-title"><i className="fas fa-comments"></i> Conversation Thread</div>
                        <span className="thread-count">{focusedMessage.thread.length} replies</span>
                      </div>
                      {focusedMessage.thread.map((t, idx) => (
                        <div key={idx} className={`thread-item ${t.isAdmin ? 'from-admin' : ''}`}>
                          <div className={`thread-avatar ${t.isAdmin ? 'admin-av' : ''}`} style={t.isAdmin ? {} : { backgroundColor: focusedMessage.color }}>
                            {t.isAdmin ? 'A' : focusedMessage.avatar}
                          </div>
                          <div className="thread-body">
                            <div className="thread-meta">
                              <span className="thread-sender">
                                {t.sender} {t.isAdmin && <span className="admin-label">Staff</span>}
                              </span>
                              <span className="thread-time">{t.time}</span>
                            </div>
                            <div className="thread-text">
                              <p>{t.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Box */}
                  <div className="reply-box" id="replyBox">
                    <div className="reply-tabs">
                      {['Reply', 'Forward', 'Internal Note'].map(tab => (
                        <div
                          key={tab}
                          className={`reply-tab ${replyTab === tab ? 'active' : ''}`}
                          onClick={() => setReplyTab(tab)}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    <div className="reply-editor">
                      <div className="reply-to-row">
                        <span className="reply-to-label">To:</span>
                        <span className="reply-to-val">
                          {replyTab === 'Internal Note'
                            ? 'Staff members (Internal note only)'
                            : `${focusedMessage.sender} <${focusedMessage.email}>`}
                        </span>
                        {replyTab !== 'Internal Note' && <span className="reply-cc" onClick={() => showToast('CC/BCC field added')}>+ CC / BCC</span>}
                      </div>

                      {replyTab !== 'Internal Note' && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '7px' }}>Quick Templates</div>
                          <div className="quick-templates">
                            {Object.keys(QUICK_TEMPLATES).map(key => (
                              <button key={key} className="qt-chip" onClick={() => handleInsertTemplate(key)}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <textarea
                        className="reply-textarea"
                        id="replyText"
                        placeholder={`Type your reply to ${focusedMessage.sender}…`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="reply-footer">
                      <div className="reply-tools">
                        <button className="reply-tool" title="Attach file" onClick={() => showToast('Attach file')}><i className="fas fa-paperclip"></i></button>
                        <button className="reply-tool" title="Bold"><i className="fas fa-bold"></i></button>
                        <button className="reply-tool" title="Italic"><i className="fas fa-italic"></i></button>
                        <button className="reply-tool" title="Link"><i className="fas fa-link"></i></button>
                        <button className="reply-tool" title="Template" onClick={() => handleInsertTemplate('apology')}><i className="fas fa-file-alt"></i></button>
                        <button className="reply-tool" title="Emoji"><i className="fas fa-smile"></i></button>
                      </div>
                      <div className="reply-send-wrap">
                        <button className="draft-btn" onClick={() => showToast('Draft saved')}><i className="fas fa-save"></i> Save Draft</button>
                        <button className="send-btn" onClick={handleSendReply}>
                          <i className="fas fa-paper-plane"></i> {replyTab === 'Internal Note' ? 'Log Note' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT SIDEBAR PANELS */}
              <div className="side-panel">
                {/* Guest Profile */}
                <div className="info-card">
                  <div className="info-card-head">
                    <div className="info-card-title"><i className="fas fa-user"></i> Guest Profile</div>
                    <span className="info-card-action" onClick={() => showToast('Opening guest profile')}><i className="fas fa-external-link-alt"></i></span>
                  </div>
                  <div className="info-card-body">
                    <div className="guest-avatar-big" style={{ backgroundColor: focusedMessage.color }}>{focusedMessage.avatar}</div>
                    <div className="guest-name-big">{focusedMessage.sender}</div>
                    <div className="guest-email-small">{focusedMessage.email}</div>
                    <div className="guest-stats-row">
                      <div className="gstat"><div className="gstat-val">{focusedMessage.guest?.Stays || '1 stay'}</div><div className="gstat-lbl">Stays</div></div>
                      <div className="gstat"><div className="gstat-val" style={{ color: 'var(--gold)' }}>{focusedMessage.guest?.Status || 'Regular'}</div><div className="gstat-lbl">Status</div></div>
                      <div className="gstat"><div className="gstat-val">3</div><div className="gstat-lbl">Messages</div></div>
                      <div className="gstat"><div className="gstat-val" style={{ color: focusedMessage.urgent ? 'var(--danger)' : 'var(--text-muted)' }}>{focusedMessage.urgent ? '1' : '0'}</div><div className="gstat-lbl">Complaints</div></div>
                    </div>
                    <div className="guest-fields">
                      <div className="gf-row">
                        <div className="gf-label">Phone</div>
                        <div className="gf-val"><a href={`tel:${focusedMessage.guest?.Phone}`}>{focusedMessage.guest?.Phone || '+251 900 000 000'}</a></div>
                      </div>
                      {focusedMessage.guest?.Company && (
                        <div className="gf-row">
                          <div className="gf-label">Company</div>
                          <div className="gf-val">{focusedMessage.guest.Company}</div>
                        </div>
                      )}
                      {focusedMessage.guest?.Room && (
                        <div className="gf-row">
                          <div className="gf-label">Current Room</div>
                          <div className="gf-val">{focusedMessage.guest.Room}</div>
                        </div>
                      )}
                      {focusedMessage.guest?.CheckIn && (
                        <div className="gf-row">
                          <div className="gf-label">Check-In</div>
                          <div className="gf-val">{focusedMessage.guest.CheckIn}</div>
                        </div>
                      )}
                      {focusedMessage.guest?.CheckOut && (
                        <div className="gf-row">
                          <div className="gf-label">Check-Out</div>
                          <div className="gf-val">{focusedMessage.guest.CheckOut}</div>
                        </div>
                      )}
                      {focusedMessage.guest?.Balance && (
                        <div className="gf-row">
                          <div className="gf-label">Balance</div>
                          <div className="gf-val" style={{ color: 'var(--success)' }}>{focusedMessage.guest.Balance}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Bookings */}
                <div className="info-card">
                  <div className="info-card-head">
                    <div className="info-card-title"><i className="fas fa-calendar-check"></i> Linked Bookings</div>
                    <span className="info-card-action" onClick={() => showToast('Opening linked bookings')}><i className="fas fa-external-link-alt"></i></span>
                  </div>
                  <div className="info-card-body">
                    <div className="booking-chip" onClick={() => showToast(`Opening booking #${focusedMessage.guest?.Booking || 'BK-2024-0115'}`)}>
                      <div className="bk-icon"><i className="fas fa-bed"></i></div>
                      <div className="bk-info">
                        <div className="bk-ref">#{focusedMessage.guest?.Booking || 'BK-2024-0115'}</div>
                        <div className="bk-desc">{focusedMessage.guest?.Room || 'Suite 201 (Nile)'}</div>
                        <div className="bk-date">{focusedMessage.guest?.Period || 'Dec 20 – Dec 23'}</div>
                      </div>
                      <span className="bk-status confirmed">Active</span>
                    </div>
                  </div>
                </div>

                {/* Message Properties */}
                <div className="info-card">
                  <div className="info-card-head">
                    <div className="info-card-title"><i className="fas fa-sliders-h"></i> Message Properties</div>
                  </div>
                  <div className="info-card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      <div className="assign-row">
                        <span className="assign-label">Assigned To</span>
                        <span className="assign-val">
                          <span className="assign-ava">{focusedMessage.assignedTo?.charAt(0) || 'A'}</span> {focusedMessage.assignedTo}
                          <span className="assign-change" onClick={() => {
                            const val = window.prompt('Enter new assignee name:', focusedMessage.assignedTo);
                            if (val) handleUpdateProperties('assignedTo', val);
                          }}><i className="fas fa-exchange-alt"></i></span>
                        </span>
                      </div>
                      <div className="assign-row">
                        <span className="assign-label">Department</span>
                        <span className="assign-val" style={{ color: 'var(--gold)' }}>{focusedMessage.department}</span>
                      </div>
                      <div className="assign-row">
                        <span className="assign-label">Status</span>
                        <span className="assign-val">
                          <select
                            value={focusedMessage.status}
                            onChange={(e) => handleUpdateProperties('status', e.target.value)}
                            style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', padding: '3px 8px', outline: 'none', cursor: 'pointer' }}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Awaiting Guest</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                          </select>
                        </span>
                      </div>
                      <div className="assign-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        <span className="assign-label">Priority</span>
                        <div className="priority-row" style={{ width: '100%' }}>
                          {['Low', 'Medium', 'High'].map(prio => (
                            <button
                              key={prio}
                              className={`prio-chip ${prio.toLowerCase()} ${focusedMessage.priority === prio ? 'active' : ''}`}
                              onClick={() => handleUpdateProperties('priority', prio)}
                            >
                              {prio}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="assign-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', paddingBottom: '0', borderBottom: 'none' }}>
                        <span className="assign-label">Tags</span>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {focusedMessage.tags.map(t => (
                            <span key={t} className={`tag ${t}`}>{t}</span>
                          ))}
                          <span className="tag" style={{ cursor: 'pointer', borderColor: 'rgba(201,168,76,0.2)', color: 'var(--text-muted)' }} onClick={() => {
                            const tag = window.prompt('Enter new tag:');
                            if (tag) handleUpdateProperties('addTag', tag.toLowerCase());
                          }}>+ add</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="info-card">
                  <div className="info-card-head">
                    <div className="info-card-title"><i className="fas fa-bolt"></i> Quick Actions</div>
                  </div>
                  <div className="info-card-body" style={{ padding: '12px' }}>
                    <div className="quick-actions">
                      <button className="qa-btn" onClick={() => {
                        showToast('Room change initiated');
                        handleUpdateProperties('status', 'In Progress');
                      }}><i className="fas fa-exchange-alt"></i> Initiate Room Change</button>
                      <button className="qa-btn" onClick={() => {
                        showToast('Maintenance ticket raised');
                        handleUpdateProperties('status', 'In Progress');
                      }}><i className="fas fa-tools"></i> Raise Maintenance Ticket</button>
                      <button className="qa-btn" onClick={() => showToast('Compensation applied')}><i className="fas fa-gift"></i> Apply Compensation</button>
                      <button className="qa-btn" onClick={() => {
                        showToast('Escalated to General Manager');
                        handleUpdateProperties('priority', 'High');
                      }}><i className="fas fa-level-up-alt"></i> Escalate to Manager</button>
                      <button className="qa-btn" onClick={() => handleUpdateProperties('status', 'Resolved')}><i className="fas fa-check-circle"></i> Mark as Resolved</button>
                      <button className="qa-btn danger" onClick={() => handleActionFocused('deleted')}><i className="fas fa-trash-alt"></i> Delete Message</button>
                    </div>
                  </div>
                </div>

                {/* Audit Timeline */}
                <div className="info-card">
                  <div className="info-card-head">
                    <div className="info-card-title"><i className="fas fa-history"></i> Activity</div>
                  </div>
                  <div className="info-card-body">
                    <div className="timeline">
                      {focusedMessage.timeline.map((item, idx) => (
                        <div key={idx} className="tl-item">
                          <div className={`tl-dot ${item.type || 'muted'}`}>
                            <i className={`fas ${
                              item.type === 'green' ? 'fa-reply' :
                              item.type === 'red' ? 'fa-tools' :
                              item.type === 'gold' ? 'fa-tag' : 'fa-info-circle'
                            }`}></i>
                          </div>
                          <div className="tl-content">
                            <div className="tl-action">{item.action}</div>
                            <div className="tl-time">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      )}

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="modal-overlay open" onClick={() => setShowComposeModal(false)}>
          <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compose-head">
              <div className="compose-title">New Message</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="compose-close" title="Minimise" onClick={() => setShowComposeModal(false)}><i className="fas fa-minus"></i></button>
                <button className="compose-close" onClick={() => setShowComposeModal(false)}><i className="fas fa-times"></i></button>
              </div>
            </div>
            <div className="compose-fields">
              <div className="cfield">
                <span className="cfield-label">To</span>
                <input
                  className="cfield-input"
                  placeholder="recipient@tsedekegrandhotel.com or guest name…"
                  value={compTo}
                  onChange={(e) => setCompTo(e.target.value)}
                />
              </div>
              <div className="cfield">
                <span className="cfield-label">CC</span>
                <input className="cfield-input" placeholder="Optional…" />
              </div>
              <div className="cfield">
                <span className="cfield-label">Sub</span>
                <input
                  className="cfield-input"
                  placeholder="Subject…"
                  value={compSubject}
                  onChange={(e) => setCompSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="compose-body">
              <textarea
                className="compose-textarea"
                placeholder="Write your message…"
                value={compContent}
                onChange={(e) => setCompContent(e.target.value)}
              ></textarea>
            </div>
            <div className="compose-foot">
              <div className="compose-tools">
                <button className="compose-tool" title="Attach"><i className="fas fa-paperclip"></i></button>
                <button className="compose-tool" title="Bold"><i className="fas fa-bold"></i></button>
                <button className="compose-tool" title="Template" onClick={() => handleInsertTemplate('apology')}><i className="fas fa-file-alt"></i></button>
                <button className="compose-tool" title="Priority"><i className="fas fa-flag"></i></button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="draft-btn-modal" onClick={() => {
                  showToast('Draft saved');
                  setShowComposeModal(false);
                }}><i className="fas fa-save"></i> Save Draft</button>
                <button className="reply-send" onClick={handleSendNewMessage}><i className="fas fa-paper-plane"></i> Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;