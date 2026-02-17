class AgentChat extends HTMLElement {
  isOpen: boolean;
  messages: any[];
  isLoading: boolean;
  isMuted: boolean;
  recognition: any;
  conversations: any[];
  activeConversationId: string | null;
  currentView: 'chat' | 'history';

  constructor() {
    super();
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.isMuted = false;
    this.recognition = null;
    this.conversations = [];
    this.activeConversationId = null;
    this.currentView = 'chat';
    this.loadState();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  getWelcomeMessage(): any {
    return {
      role: 'assistant',
      content: "Hi! I'm Itai's AI assistant. Ask me about his projects, experience, or skills.",
    };
  }

  loadState() {
    const saved = localStorage.getItem('arctica_agent_conversations');
    if (saved) {
      try {
        this.conversations = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load conversations', e);
        this.conversations = [];
      }
    }

    // Migration from old format
    if (!this.conversations.length) {
      const oldMessages = localStorage.getItem('arctica_agent_messages');
      if (oldMessages) {
        try {
          const messages = JSON.parse(oldMessages);
          const now = Date.now();
          const conv = {
            id: this.generateId(),
            title: this.extractTitle(messages),
            createdAt: now,
            updatedAt: now,
            messages: messages,
          };
          this.conversations = [conv];
          this.saveState();
          localStorage.removeItem('arctica_agent_messages');
        } catch (e) {
          console.error('Failed to migrate old messages', e);
        }
      }
    }

    // Set active conversation to most recent, or create first one
    if (this.conversations.length) {
      const sorted = [...this.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
      this.activeConversationId = sorted[0].id;
      this.messages = sorted[0].messages;
    } else {
      this.createFirstConversation();
    }
  }

  createFirstConversation() {
    const now = Date.now();
    const conv = {
      id: this.generateId(),
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [this.getWelcomeMessage()],
    };
    this.conversations = [conv];
    this.activeConversationId = conv.id;
    this.messages = conv.messages;
    this.saveState();
  }

  extractTitle(messages: any[]): string {
    const firstUser = messages.find((m: any) => m.role === 'user');
    if (firstUser && firstUser.content) {
      const text = firstUser.content.trim();
      return text.length > 40 ? text.substring(0, 40) + '...' : text;
    }
    return 'New conversation';
  }

  saveState() {
    if (this.activeConversationId) {
      const conv = this.conversations.find((c: any) => c.id === this.activeConversationId);
      if (conv) {
        conv.messages = this.messages;
        conv.updatedAt = Date.now();
        conv.title = this.extractTitle(conv.messages);
      }
    }
    localStorage.setItem('arctica_agent_conversations', JSON.stringify(this.conversations));
  }

  clearChat() {
    this.createConversation();
  }

  createConversation() {
    const now = Date.now();
    const conv = {
      id: this.generateId(),
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [this.getWelcomeMessage()],
    };
    this.conversations.push(conv);
    this.activeConversationId = conv.id;
    this.messages = conv.messages;
    this.saveState();
    this.currentView = 'chat';
    this.updateViewState();
    this.renderMessages();
    const suggestions = this.querySelector('.agent-suggestions') as HTMLElement;
    if (suggestions) suggestions.classList.remove('collapsed');
  }

  switchToConversation(id: string) {
    const conv = this.conversations.find((c: any) => c.id === id);
    if (!conv) return;
    this.activeConversationId = id;
    this.messages = conv.messages;
    this.currentView = 'chat';
    this.updateViewState();
    this.renderMessages();
    if (this.messages.length > 1) {
      this.hideSuggestions();
    } else {
      const suggestions = this.querySelector('.agent-suggestions') as HTMLElement;
      if (suggestions) suggestions.classList.remove('collapsed');
    }
  }

  deleteConversation(id: string) {
    this.conversations = this.conversations.filter((c: any) => c.id !== id);
    if (this.activeConversationId === id) {
      if (this.conversations.length) {
        const sorted = [...this.conversations].sort((a: any, b: any) => b.updatedAt - a.updatedAt);
        this.activeConversationId = sorted[0].id;
        this.messages = sorted[0].messages;
      } else {
        this.createFirstConversation();
      }
    }
    this.saveState();
    this.renderHistoryView();
  }

  switchView(view: 'chat' | 'history') {
    this.currentView = view;
    this.updateViewState();
    if (view === 'history') {
      this.renderHistoryView();
    }
  }

  updateViewState() {
    const messagesEl = this.querySelector('.agent-messages') as HTMLElement;
    const historyEl = this.querySelector('.agent-history') as HTMLElement;
    const suggestionsEl = this.querySelector('.agent-suggestions') as HTMLElement;
    const inputArea = this.querySelector('.agent-input-area') as HTMLElement;
    const tabChat = this.querySelector('.agent-tab-chat') as HTMLElement;
    const tabHistory = this.querySelector('.agent-tab-history') as HTMLElement;

    if (this.currentView === 'chat') {
      messagesEl?.classList.remove('agent-hidden');
      historyEl?.classList.add('agent-hidden');
      suggestionsEl?.classList.remove('agent-hidden');
      inputArea?.classList.remove('agent-hidden');
      tabChat?.classList.add('active');
      tabHistory?.classList.remove('active');
      if (this.messages.length > 1) {
        suggestionsEl?.classList.add('collapsed');
      }
    } else {
      messagesEl?.classList.add('agent-hidden');
      historyEl?.classList.remove('agent-hidden');
      suggestionsEl?.classList.add('agent-hidden');
      inputArea?.classList.add('agent-hidden');
      tabChat?.classList.remove('active');
      tabHistory?.classList.add('active');
    }
  }

  renderHistoryView() {
    const historyEl = this.querySelector('.agent-history');
    if (!historyEl) return;
    historyEl.textContent = '';

    const sorted = [...this.conversations].sort((a: any, b: any) => b.updatedAt - a.updatedAt);

    if (!sorted.length) {
      const empty = document.createElement('div');
      empty.className = 'agent-history-empty';
      empty.textContent = 'No conversations yet. Start chatting!';
      historyEl.appendChild(empty);
      return;
    }

    sorted.forEach((conv: any) => {
      const item = document.createElement('div');
      item.className = 'agent-history-item';
      if (conv.id === this.activeConversationId) {
        item.classList.add('active');
      }
      item.dataset.convId = conv.id;

      const info = document.createElement('div');
      info.className = 'agent-history-info';

      const title = document.createElement('div');
      title.className = 'agent-history-title';
      title.textContent = conv.title || 'New conversation';

      const meta = document.createElement('div');
      meta.className = 'agent-history-meta';
      const msgCount = conv.messages.filter((m: any) => m.role === 'user').length;
      meta.textContent =
        this.formatTimeAgo(conv.updatedAt) +
        ' \u00B7 ' +
        msgCount +
        ' message' +
        (msgCount !== 1 ? 's' : '');

      info.appendChild(title);
      info.appendChild(meta);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'agent-icon-btn agent-history-delete';
      deleteBtn.title = 'Delete conversation';
      const deleteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      deleteSvg.setAttribute('width', '14');
      deleteSvg.setAttribute('height', '14');
      deleteSvg.setAttribute('viewBox', '0 0 24 24');
      deleteSvg.setAttribute('fill', 'none');
      deleteSvg.setAttribute('stroke', 'currentColor');
      deleteSvg.setAttribute('stroke-width', '2');
      deleteSvg.setAttribute('stroke-linecap', 'round');
      deleteSvg.setAttribute('stroke-linejoin', 'round');
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M3 6h18');
      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6');
      const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path3.setAttribute('d', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2');
      deleteSvg.appendChild(path1);
      deleteSvg.appendChild(path2);
      deleteSvg.appendChild(path3);
      deleteBtn.appendChild(deleteSvg);
      deleteBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.deleteConversation(conv.id);
      });

      item.appendChild(info);
      item.appendChild(deleteBtn);

      item.addEventListener('click', () => {
        this.switchToConversation(conv.id);
      });

      historyEl.appendChild(item);
    });
  }

  formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return minutes + ' min ago';
    if (hours < 24) return hours + 'h ago';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + 'd ago';

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  renderMessages() {
    const messagesContainer = this.querySelector('.agent-messages');
    if (messagesContainer) {
      messagesContainer.textContent = '';
      this.messages.forEach((_msg, index) => {
        this.renderMessageAtIndex(index, true);
      });
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  connectedCallback() {
    this.render();
    this.renderMessages();
    this.addEventListeners();
    this.updateViewState();

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    if (this.messages.length > 1) {
      this.hideSuggestions();
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = this.querySelector('.agent-widget-container');

    if (this.isOpen) {
      chatWindow?.classList.add('open');
      setTimeout(() => {
        (this.querySelector('.agent-input') as HTMLInputElement)?.focus();
      }, 100);
    } else {
      chatWindow?.classList.remove('open');
    }
  }

  hideSuggestions() {
    const suggestions = this.querySelector('.agent-suggestions') as HTMLElement;
    if (suggestions && !suggestions.classList.contains('collapsed')) {
      suggestions.classList.add('collapsed');
    }
  }

  async sendMessage(isVoice = false, skipInputRead = false) {
    let text = '';

    if (!skipInputRead) {
      const input = this.querySelector('.agent-input') as HTMLInputElement;
      if (!input) return;
      text = input.value.trim();
      if (!text) return;
      this.addMessage({ role: 'user', content: text });
      this.saveState();
      input.value = '';
      this.updateSendButtonState();
    }

    this.hideSuggestions();

    this.isLoading = true;
    this.updateLoadingState();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.messages.map((m) => ({
            role: m.role,
            content: m.content || JSON.stringify(m.component),
          })),
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const assistantMsgIndex = this.messages.length;
      this.addMessage({ role: 'assistant', content: '' });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantMessageContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';

              if (content) {
                assistantMessageContent += content;

                const jsonStartIdx = assistantMessageContent.indexOf('{');

                if (jsonStartIdx !== -1) {
                  const visibleText = assistantMessageContent.substring(0, jsonStartIdx).trim();

                  if (visibleText) {
                    this.updateMessageContent(assistantMsgIndex, visibleText + ' ...');
                  } else {
                    this.updateMessageContent(assistantMsgIndex, 'Thinking...');
                  }
                } else {
                  this.updateMessageContent(assistantMsgIndex, assistantMessageContent);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE JSON:', e);
            }
          }
        }
      }

      if (isVoice && assistantMessageContent && !this.isMuted) {
        this.speak(assistantMessageContent);
      }

      try {
        const { text, component } = this.extractComponent(assistantMessageContent);
        if (component) {
          this.messages[assistantMsgIndex].content = text;
          this.messages[assistantMsgIndex].component = component;
          this.renderMessageAtIndex(assistantMsgIndex);
        }
        this.saveState();
      } catch (e) {
        // Not valid JSON, keep as text
      }
    } catch (error) {
      console.error('Error:', error);
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong.',
      });
      if (isVoice && !this.isMuted) this.speak('Sorry, something went wrong.');
    } finally {
      this.isLoading = false;
      this.updateLoadingState();

      const voiceBar = this.querySelector('.agent-voice-bar');
      if (voiceBar?.classList.contains('active')) {
        this.stopVoiceMode(false);
      }
    }
  }

  renderMessageAtIndex(index: number, append = false) {
    const messagesContainer = this.querySelector('.agent-messages');
    if (!messagesContainer) return;

    let msgEl;
    if (append) {
      msgEl = document.createElement('div');
      const msg = this.messages[index];
      msgEl.className = `agent-message ${msg.role}`;
      messagesContainer.appendChild(msgEl);
    } else {
      msgEl = messagesContainer.children[index] as HTMLElement;
    }

    const msg = this.messages[index];

    if (msgEl) {
      msgEl.textContent = '';

      if (msg.role === 'assistant') {
        const avatar = document.createElement('div');
        avatar.className = 'agent-avatar';
        const avatarText = document.createElement('span');
        avatarText.textContent = 'A';
        avatar.appendChild(avatarText);
        msgEl.appendChild(avatar);
      }

      const bubble = document.createElement('div');
      bubble.className = 'agent-bubble';

      if (msg.content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'agent-message-text';
        textDiv.textContent = msg.content;
        bubble.appendChild(textDiv);
      }

      if (msg.component) {
        const componentEl = document.createElement('div');
        componentEl.className = 'agent-component-wrapper';
        this.renderComponentSafe(componentEl, msg.component);
        bubble.appendChild(componentEl);
      }

      msgEl.appendChild(bubble);
    }
  }

  extractComponent(content: string): { text: string; component: any | null } {
    const potentialStarts = [];
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') potentialStarts.push(i);
    }

    for (const start of potentialStarts) {
      let balance = 0;
      for (let j = start; j < content.length; j++) {
        if (content[j] === '{') balance++;
        else if (content[j] === '}') balance--;

        if (balance === 0) {
          try {
            const jsonStr = content.substring(start, j + 1);
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === 'component' || (parsed.name && parsed.props)) {
              let textBefore = content.substring(0, start).trim();
              let textAfter = content.substring(j + 1).trim();

              if (textBefore.endsWith('```json')) {
                textBefore = textBefore.substring(0, textBefore.length - 7).trim();
              } else if (textBefore.endsWith('```')) {
                textBefore = textBefore.substring(0, textBefore.length - 3).trim();
              }

              if (textAfter.startsWith('```')) {
                textAfter = textAfter.substring(3).trim();
              }

              return {
                text: (textBefore + '\n\n' + textAfter).trim(),
                component: parsed,
              };
            }
          } catch (e) {
            // Check next
          }
          break;
        }
      }
    }

    return { text: content, component: null };
  }

  speak(text: string) {
    if (!window.speechSynthesis || this.isMuted) return;
    window.speechSynthesis.cancel();

    let spokenText = text;
    try {
      const { text: cleanText } = this.extractComponent(text);
      if (cleanText) spokenText = cleanText;
    } catch (e) {
      /* use original */
    }

    spokenText = spokenText
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n+/g, '. ')
      .trim();

    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;

      const preferences = [
        'Samantha',
        'Alex',
        'Karen',
        'Daniel',
        'Google US English',
        'Google UK English',
        'Microsoft Zira',
        'Microsoft David',
      ];

      for (const pref of preferences) {
        const match = voices.find((v) => v.name.includes(pref));
        if (match) return match;
      }

      const englishVoice = voices.find((v) => v.lang.startsWith('en'));
      return englishVoice || voices[0];
    };

    const voice = selectVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  updateMessageContent(index: number, content: string) {
    this.messages[index].content = content;
    const messagesContainer = this.querySelector('.agent-messages');
    if (!messagesContainer) return;
    const msgEl = messagesContainer.children[index] as HTMLElement;
    if (msgEl) {
      let bubble = msgEl.querySelector('.agent-bubble');
      if (!bubble) {
        msgEl.textContent = '';
        if (this.messages[index].role === 'assistant') {
          const avatar = document.createElement('div');
          avatar.className = 'agent-avatar';
          const avatarText = document.createElement('span');
          avatarText.textContent = 'A';
          avatar.appendChild(avatarText);
          msgEl.appendChild(avatar);
        }
        bubble = document.createElement('div');
        bubble.className = 'agent-bubble';
        msgEl.appendChild(bubble);
      }
      let textDiv = bubble.querySelector('.agent-message-text');
      if (!textDiv) {
        textDiv = document.createElement('div');
        textDiv.className = 'agent-message-text';
        bubble.appendChild(textDiv);
      }
      textDiv.textContent = content;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  addMessage(msg: { role: string; content?: string; component?: any }) {
    this.messages.push(msg);
    const messagesContainer = this.querySelector('.agent-messages');
    if (!messagesContainer) return;
    const msgEl = document.createElement('div');
    msgEl.className = `agent-message ${msg.role}`;

    if (msg.role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'agent-avatar';
      const avatarText = document.createElement('span');
      avatarText.textContent = 'A';
      avatar.appendChild(avatarText);
      msgEl.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'agent-bubble';

    if (msg.content) {
      const textDiv = document.createElement('div');
      textDiv.className = 'agent-message-text';
      textDiv.textContent = msg.content;
      bubble.appendChild(textDiv);
    }

    if (msg.component) {
      const componentEl = document.createElement('div');
      componentEl.className = 'agent-component-wrapper';
      this.renderComponentSafe(componentEl, msg.component);
      bubble.appendChild(componentEl);
    }

    msgEl.appendChild(bubble);
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  renderComponentSafe(container: HTMLElement, component: any): void {
    if (!component || !component.name) return;

    if (component.name === 'Layout') {
      const layout = document.createElement('div');
      const direction = component.props?.direction === 'row' ? 'row' : 'col';
      layout.className = `gen-layout ${direction}`;
      const gap = component.props?.gap || 'md';
      layout.style.gap = `var(--space-${gap}, 1rem)`;
      if (Array.isArray(component.props?.children)) {
        component.props.children.forEach((child: any) => {
          this.renderComponentSafe(layout, child);
        });
      }
      container.appendChild(layout);
      return;
    }

    if (component.name === 'DataCard') {
      const card = document.createElement('div');
      card.className = 'gen-card';
      if (component.props?.title) {
        const h4 = document.createElement('h4');
        h4.textContent = component.props.title;
        card.appendChild(h4);
      }
      if (component.props?.value) {
        const val = document.createElement('div');
        val.className = 'gen-card-value';
        val.textContent = component.props.value;
        card.appendChild(val);
      }
      if (component.props?.label) {
        const lbl = document.createElement('div');
        lbl.className = 'gen-card-label';
        lbl.textContent = component.props.label;
        card.appendChild(lbl);
      }
      if (component.props?.description) {
        const desc = document.createElement('p');
        desc.className = 'gen-card-desc';
        desc.textContent = component.props.description;
        card.appendChild(desc);
      }
      container.appendChild(card);
      return;
    }

    if (component.name === 'List') {
      const list = document.createElement('div');
      list.className = 'gen-list';
      const items = component.props?.items || [];
      items.forEach((item: any) => {
        const row = document.createElement('div');
        row.className = 'gen-list-item';
        if (item.icon) {
          const icon = document.createElement('span');
          icon.className = 'gen-list-icon';
          icon.textContent = item.icon;
          row.appendChild(icon);
        } else {
          const bullet = document.createElement('span');
          bullet.className = 'gen-list-bullet';
          row.appendChild(bullet);
        }
        const content = document.createElement('div');
        content.className = 'gen-list-content';
        if (item.title) {
          const strong = document.createElement('strong');
          strong.textContent = item.title;
          content.appendChild(strong);
        }
        if (item.description) {
          const span = document.createElement('span');
          span.textContent = (item.title ? ': ' : '') + item.description;
          content.appendChild(span);
        }
        row.appendChild(content);
        list.appendChild(row);
      });
      container.appendChild(list);
      return;
    }

    if (component.name === 'Table') {
      const wrapper = document.createElement('div');
      wrapper.className = 'gen-table-wrapper';
      const table = document.createElement('table');
      table.className = 'gen-table';
      const headers = component.props?.headers || [];
      const rows = component.props?.rows || [];
      if (headers.length) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        headers.forEach((h: string) => {
          const th = document.createElement('th');
          th.textContent = h;
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
      }
      if (rows.length) {
        const tbody = document.createElement('tbody');
        rows.forEach((row: string[]) => {
          const tr = document.createElement('tr');
          row.forEach((cell: string) => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
      }
      wrapper.appendChild(table);
      container.appendChild(wrapper);
      return;
    }

    if (component.name === 'Action') {
      const label = component.props?.label || 'Click me';
      const action = component.props?.action || '#';
      const type = component.props?.type || 'button';
      if (type === 'link') {
        const a = document.createElement('a');
        a.href = action;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'gen-action-btn';
        a.textContent = label;
        container.appendChild(a);
      } else {
        const btn = document.createElement('button');
        btn.className = 'gen-action-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          window.location.href = action;
        });
        container.appendChild(btn);
      }
      return;
    }

    if (component.name === 'ProjectCard') {
      const card = document.createElement('div');
      card.className = 'gen-card';
      if (component.props?.title) {
        const h4 = document.createElement('h4');
        h4.textContent = component.props.title;
        h4.style.cssText = 'color: var(--color-text, #1a1715); font-size: 1rem;';
        card.appendChild(h4);
      }
      if (component.props?.description) {
        const p = document.createElement('p');
        p.className = 'gen-card-desc';
        p.textContent = component.props.description;
        card.appendChild(p);
      }
      if (Array.isArray(component.props?.tech)) {
        const stack = document.createElement('div');
        stack.className = 'gen-tech-stack';
        component.props.tech.forEach((t: string) => {
          const span = document.createElement('span');
          span.textContent = t;
          stack.appendChild(span);
        });
        card.appendChild(stack);
      }
      container.appendChild(card);
      return;
    }

    if (component.name === 'CodeSnippet') {
      const pre = document.createElement('pre');
      pre.className = 'gen-code';
      const code = document.createElement('code');
      code.textContent = component.props?.code || '';
      pre.appendChild(code);
      container.appendChild(pre);
      return;
    }

    if (component.name === 'WeatherWidget') {
      const card = document.createElement('div');
      card.className = 'gen-card';
      card.style.textAlign = 'center';
      const h4 = document.createElement('h4');
      h4.textContent = 'Weather in ' + (component.props?.location || '');
      card.appendChild(h4);
      const val = document.createElement('div');
      val.className = 'gen-card-value';
      val.textContent = '24\u00B0C';
      card.appendChild(val);
      const lbl = document.createElement('div');
      lbl.className = 'gen-card-label';
      lbl.textContent = 'Sunny';
      card.appendChild(lbl);
      container.appendChild(card);
      return;
    }

    const unknown = document.createElement('div');
    unknown.textContent = 'Unknown Component: ' + component.name;
    container.appendChild(unknown);
  }

  updateLoadingState() {
    const loadingEl = this.querySelector('.agent-loading') as HTMLElement;
    if (!loadingEl) return;

    if (this.isLoading) {
      loadingEl.classList.remove('agent-hidden');
    } else {
      loadingEl.classList.add('agent-hidden');
    }
  }

  updateSendButtonState() {
    const input = this.querySelector('.agent-input') as HTMLInputElement;
    const sendBtn = this.querySelector('.agent-send-btn') as HTMLElement;
    if (!input || !sendBtn) return;

    if (input.value.trim()) {
      sendBtn.classList.add('has-text');
    } else {
      sendBtn.classList.remove('has-text');
    }
  }

  addEventListeners() {
    this.querySelector('.agent-send-btn')?.addEventListener('click', () => this.sendMessage());

    this.querySelector('.agent-trigger-btn')?.addEventListener('click', () => this.toggleChat());

    this.querySelector('.agent-header-close-btn')?.addEventListener('click', () =>
      this.toggleChat(),
    );

    this.querySelector('.agent-clear-btn')?.addEventListener('click', () => this.clearChat());

    this.querySelector('.agent-mic-btn')?.addEventListener('click', () => this.startVoiceMode());

    this.querySelector('.agent-keyboard-btn')?.addEventListener('click', () =>
      this.stopVoiceMode(),
    );

    this.querySelector('.agent-hangup-btn')?.addEventListener('click', () => this.stopVoiceMode());

    this.querySelector('.agent-mute-btn')?.addEventListener('click', () => this.toggleMute());

    this.querySelector('.agent-input')?.addEventListener('keypress', (e: any) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    this.querySelector('.agent-input')?.addEventListener('input', () =>
      this.updateSendButtonState(),
    );

    const chips = this.querySelectorAll('.agent-suggestion-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', (e: any) => {
        const text = e.target.textContent;
        const input = this.querySelector('.agent-input') as HTMLInputElement;
        if (input) {
          input.value = text;
          this.sendMessage();
        }
      });
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const volOn = this.querySelector('.vol-on');
    const volOff = this.querySelector('.vol-off');
    if (this.isMuted) {
      window.speechSynthesis.cancel();
      volOn?.classList.add('agent-hidden');
      volOff?.classList.remove('agent-hidden');
    } else {
      volOn?.classList.remove('agent-hidden');
      volOff?.classList.add('agent-hidden');
    }
  }

  startVoiceMode() {
    const voiceBar = this.querySelector('.agent-voice-bar');
    const inputWrapper = this.querySelector('.agent-input-wrapper');

    voiceBar?.classList.add('active');
    inputWrapper?.classList.add('agent-hidden');

    this.startListening();
  }

  stopVoiceMode(cancelSpeech = true) {
    const voiceBar = this.querySelector('.agent-voice-bar');
    const inputWrapper = this.querySelector('.agent-input-wrapper');

    voiceBar?.classList.remove('active');
    inputWrapper?.classList.remove('agent-hidden');

    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    if (cancelSpeech) {
      window.speechSynthesis.cancel();
    }
  }

  startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.stopVoiceMode();
      this.addMessage({
        role: 'assistant',
        content:
          "Voice input isn't supported in this browser. Try Chrome or Edge for the best experience.",
      });
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      const statusEl = this.querySelector('.agent-voice-status');
      if (statusEl) {
        const textNode = statusEl.childNodes[statusEl.childNodes.length - 1];
        if (textNode) textNode.textContent = ' Listening...';
      }
    };

    this.recognition.onend = () => {};

    this.recognition.onresult = (event: any) => {
      const result = event.results[0];
      const text = result[0].transcript;

      if (result.isFinal) {
        if (text.trim()) {
          this.addMessage({ role: 'user', content: text.trim() });
          this.sendMessage(true, true);
        }
      } else {
        const statusEl = this.querySelector('.agent-voice-status');
        if (statusEl) {
          const textNode = statusEl.childNodes[statusEl.childNodes.length - 1];
          if (textNode) textNode.textContent = ` "${text}..."`;
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);

      if (event.error === 'not-allowed') {
        this.stopVoiceMode();
        this.addMessage({
          role: 'assistant',
          content:
            'Microphone access was denied. Please allow microphone access in your browser settings and try again.',
        });
      } else if (event.error === 'no-speech') {
        const statusEl = this.querySelector('.agent-voice-status');
        if (statusEl) {
          const textNode = statusEl.childNodes[statusEl.childNodes.length - 1];
          if (textNode) textNode.textContent = " Didn't catch that, try again...";
        }
        const voiceBar = this.querySelector('.agent-voice-bar');
        if (voiceBar?.classList.contains('active')) {
          setTimeout(() => this.startListening(), 500);
        }
      } else if (event.error === 'aborted') {
        // User or system aborted
      } else {
        this.stopVoiceMode();
      }
    };

    this.recognition.start();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'agent-widget-container';

    const chatWindow = document.createElement('div');
    chatWindow.className = 'agent-container';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'Arctica AI Chat');

    // Header
    const header = document.createElement('div');
    header.className = 'agent-header';

    const headerAvatar = document.createElement('div');
    headerAvatar.className = 'agent-header-avatar';
    headerAvatar.textContent = 'AI';

    const headerInfo = document.createElement('div');
    headerInfo.className = 'agent-header-info';
    const headerTitle = document.createElement('div');
    headerTitle.className = 'agent-header-title';
    headerTitle.textContent = 'Arctica AI';
    const headerSubtitle = document.createElement('div');
    headerSubtitle.className = 'agent-header-subtitle';
    const statusDot = document.createElement('span');
    statusDot.className = 'agent-status-dot';
    headerSubtitle.appendChild(statusDot);
    headerSubtitle.appendChild(document.createTextNode(' Ask anything about my work'));
    headerInfo.appendChild(headerTitle);
    headerInfo.appendChild(headerSubtitle);

    const loading = document.createElement('div');
    loading.className = 'agent-loading agent-hidden';
    const loadingDots = document.createElement('div');
    loadingDots.className = 'agent-loading-dots';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'agent-dot';
      loadingDots.appendChild(dot);
    }
    loading.appendChild(loadingDots);

    const headerActions = document.createElement('div');
    headerActions.className = 'agent-header-actions';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'agent-icon-btn agent-clear-btn';
    clearBtn.title = 'New chat';
    clearBtn.setAttribute('aria-label', 'New chat');
    const clearSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clearSvg.setAttribute('width', '16');
    clearSvg.setAttribute('height', '16');
    clearSvg.setAttribute('viewBox', '0 0 24 24');
    clearSvg.setAttribute('fill', 'none');
    clearSvg.setAttribute('stroke', 'currentColor');
    clearSvg.setAttribute('stroke-width', '2');
    clearSvg.setAttribute('stroke-linecap', 'round');
    clearSvg.setAttribute('stroke-linejoin', 'round');
    clearSvg.setAttribute('aria-hidden', 'true');
    const clearPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clearPath.setAttribute(
      'd',
      'M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
    );
    clearSvg.appendChild(clearPath);
    clearBtn.appendChild(clearSvg);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'agent-icon-btn agent-header-close-btn';
    closeBtn.title = 'Close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeSvg.setAttribute('width', '18');
    closeSvg.setAttribute('height', '18');
    closeSvg.setAttribute('viewBox', '0 0 24 24');
    closeSvg.setAttribute('fill', 'none');
    closeSvg.setAttribute('stroke', 'currentColor');
    closeSvg.setAttribute('stroke-width', '2');
    closeSvg.setAttribute('stroke-linecap', 'round');
    closeSvg.setAttribute('stroke-linejoin', 'round');
    closeSvg.setAttribute('aria-hidden', 'true');
    const closeLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    closeLine1.setAttribute('x1', '18');
    closeLine1.setAttribute('y1', '6');
    closeLine1.setAttribute('x2', '6');
    closeLine1.setAttribute('y2', '18');
    const closeLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    closeLine2.setAttribute('x1', '6');
    closeLine2.setAttribute('y1', '6');
    closeLine2.setAttribute('x2', '18');
    closeLine2.setAttribute('y2', '18');
    closeSvg.appendChild(closeLine1);
    closeSvg.appendChild(closeLine2);
    closeBtn.appendChild(closeSvg);

    headerActions.appendChild(clearBtn);
    headerActions.appendChild(closeBtn);

    header.appendChild(headerAvatar);
    header.appendChild(headerInfo);
    header.appendChild(loading);
    header.appendChild(headerActions);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.className = 'agent-tab-bar';

    const tabChat = document.createElement('button');
    tabChat.className = 'agent-tab agent-tab-chat active';
    tabChat.textContent = 'Chat';
    tabChat.addEventListener('click', () => this.switchView('chat'));

    const tabHistory = document.createElement('button');
    tabHistory.className = 'agent-tab agent-tab-history';
    tabHistory.textContent = 'History';
    tabHistory.addEventListener('click', () => this.switchView('history'));

    const newChatBtn = document.createElement('button');
    newChatBtn.className = 'agent-icon-btn agent-new-chat-btn';
    newChatBtn.title = 'New chat';
    newChatBtn.textContent = '+';
    newChatBtn.addEventListener('click', () => this.createConversation());

    tabBar.appendChild(tabChat);
    tabBar.appendChild(tabHistory);
    tabBar.appendChild(newChatBtn);

    // Messages
    const messages = document.createElement('div');
    messages.className = 'agent-messages';
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-label', 'Chat messages');
    messages.setAttribute('aria-live', 'polite');

    // History view
    const historyView = document.createElement('div');
    historyView.className = 'agent-history agent-hidden';

    // Suggestions
    const suggestions = document.createElement('div');
    suggestions.className = 'agent-suggestions';
    const chipTexts = [
      'Tell me about Eventimio',
      'What services do you offer?',
      'Why "Direct Access"?',
      'Contact Itai',
    ];
    chipTexts.forEach((text) => {
      const chip = document.createElement('button');
      chip.className = 'agent-suggestion-chip';
      chip.textContent = text;
      suggestions.appendChild(chip);
    });

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'agent-input-area';

    // Voice bar
    const voiceBar = document.createElement('div');
    voiceBar.className = 'agent-voice-bar';
    const voiceControls = document.createElement('div');
    voiceControls.className = 'agent-voice-controls';

    const keyboardBtn = document.createElement('button');
    keyboardBtn.className = 'agent-icon-btn agent-keyboard-btn';
    keyboardBtn.title = 'Switch to Keyboard';
    const kbSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    kbSvg.setAttribute('width', '18');
    kbSvg.setAttribute('height', '18');
    kbSvg.setAttribute('viewBox', '0 0 24 24');
    kbSvg.setAttribute('fill', 'none');
    kbSvg.setAttribute('stroke', 'currentColor');
    kbSvg.setAttribute('stroke-width', '2');
    kbSvg.setAttribute('stroke-linecap', 'round');
    kbSvg.setAttribute('stroke-linejoin', 'round');
    const kbRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    kbRect.setAttribute('x', '2');
    kbRect.setAttribute('y', '4');
    kbRect.setAttribute('width', '20');
    kbRect.setAttribute('height', '16');
    kbRect.setAttribute('rx', '2');
    const kbPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    kbPath.setAttribute(
      'd',
      'M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M6 16h.001M10 16h5',
    );
    kbSvg.appendChild(kbRect);
    kbSvg.appendChild(kbPath);
    keyboardBtn.appendChild(kbSvg);

    const voiceStatus = document.createElement('div');
    voiceStatus.className = 'agent-voice-status';
    const pulseDot = document.createElement('div');
    pulseDot.className = 'agent-pulse-dot';
    voiceStatus.appendChild(pulseDot);
    voiceStatus.appendChild(document.createTextNode(' Listening...'));

    const muteBtn = document.createElement('button');
    muteBtn.className = 'agent-icon-btn agent-mute-btn';
    muteBtn.title = 'Toggle Mute';

    const muteSvgOn = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    muteSvgOn.classList.add('vol-on');
    muteSvgOn.setAttribute('width', '18');
    muteSvgOn.setAttribute('height', '18');
    muteSvgOn.setAttribute('viewBox', '0 0 24 24');
    muteSvgOn.setAttribute('fill', 'none');
    muteSvgOn.setAttribute('stroke', 'currentColor');
    muteSvgOn.setAttribute('stroke-width', '2');
    muteSvgOn.setAttribute('stroke-linecap', 'round');
    muteSvgOn.setAttribute('stroke-linejoin', 'round');
    const volPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    volPoly.setAttribute('points', '11 5 6 9 2 9 2 15 6 15 11 19 11 5');
    const volPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    volPath1.setAttribute('d', 'M19.07 4.93a10 10 0 0 1 0 14.14');
    const volPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    volPath2.setAttribute('d', 'M15.54 8.46a5 5 0 0 1 0 7.07');
    muteSvgOn.appendChild(volPoly);
    muteSvgOn.appendChild(volPath1);
    muteSvgOn.appendChild(volPath2);

    const muteSvgOff = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    muteSvgOff.classList.add('vol-off', 'agent-hidden');
    muteSvgOff.setAttribute('width', '18');
    muteSvgOff.setAttribute('height', '18');
    muteSvgOff.setAttribute('viewBox', '0 0 24 24');
    muteSvgOff.setAttribute('fill', 'none');
    muteSvgOff.setAttribute('stroke', 'currentColor');
    muteSvgOff.setAttribute('stroke-width', '2');
    muteSvgOff.setAttribute('stroke-linecap', 'round');
    muteSvgOff.setAttribute('stroke-linejoin', 'round');
    const volPolyOff = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    volPolyOff.setAttribute('points', '11 5 6 9 2 9 2 15 6 15 11 19 11 5');
    const muteLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    muteLine1.setAttribute('x1', '23');
    muteLine1.setAttribute('y1', '9');
    muteLine1.setAttribute('x2', '17');
    muteLine1.setAttribute('y2', '15');
    const muteLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    muteLine2.setAttribute('x1', '17');
    muteLine2.setAttribute('y1', '9');
    muteLine2.setAttribute('x2', '23');
    muteLine2.setAttribute('y2', '15');
    muteSvgOff.appendChild(volPolyOff);
    muteSvgOff.appendChild(muteLine1);
    muteSvgOff.appendChild(muteLine2);
    muteBtn.appendChild(muteSvgOn);
    muteBtn.appendChild(muteSvgOff);

    const hangupBtn = document.createElement('button');
    hangupBtn.className = 'agent-icon-btn agent-hangup-btn';
    hangupBtn.title = 'End Voice Mode';
    const hangupSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hangupSvg.setAttribute('width', '16');
    hangupSvg.setAttribute('height', '16');
    hangupSvg.setAttribute('viewBox', '0 0 24 24');
    hangupSvg.setAttribute('fill', 'none');
    hangupSvg.setAttribute('stroke', 'currentColor');
    hangupSvg.setAttribute('stroke-width', '2');
    hangupSvg.setAttribute('stroke-linecap', 'round');
    hangupSvg.setAttribute('stroke-linejoin', 'round');
    const hangupPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hangupPath.setAttribute('d', 'M18.36 6.64a9 9 0 1 1-12.73 0');
    const hangupLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hangupLine.setAttribute('x1', '12');
    hangupLine.setAttribute('y1', '2');
    hangupLine.setAttribute('x2', '12');
    hangupLine.setAttribute('y2', '12');
    hangupSvg.appendChild(hangupPath);
    hangupSvg.appendChild(hangupLine);
    hangupBtn.appendChild(hangupSvg);

    voiceControls.appendChild(keyboardBtn);
    voiceControls.appendChild(voiceStatus);
    voiceControls.appendChild(muteBtn);
    voiceControls.appendChild(hangupBtn);
    voiceBar.appendChild(voiceControls);

    // Input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'agent-input-wrapper';

    const micBtn = document.createElement('button');
    micBtn.className = 'agent-mic-btn';
    micBtn.title = 'Voice Mode';
    micBtn.setAttribute('aria-label', 'Voice input');
    const micSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    micSvg.setAttribute('width', '18');
    micSvg.setAttribute('height', '18');
    micSvg.setAttribute('viewBox', '0 0 24 24');
    micSvg.setAttribute('fill', 'none');
    micSvg.setAttribute('stroke', 'currentColor');
    micSvg.setAttribute('stroke-width', '2');
    micSvg.setAttribute('stroke-linecap', 'round');
    micSvg.setAttribute('stroke-linejoin', 'round');
    const micPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    micPath1.setAttribute('d', 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z');
    const micPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    micPath2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
    const micLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    micLine1.setAttribute('x1', '12');
    micLine1.setAttribute('y1', '19');
    micLine1.setAttribute('x2', '12');
    micLine1.setAttribute('y2', '23');
    const micLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    micLine2.setAttribute('x1', '8');
    micLine2.setAttribute('y1', '23');
    micLine2.setAttribute('x2', '16');
    micLine2.setAttribute('y2', '23');
    micSvg.appendChild(micPath1);
    micSvg.appendChild(micPath2);
    micSvg.appendChild(micLine1);
    micSvg.appendChild(micLine2);
    micBtn.appendChild(micSvg);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'agent-input';
    input.placeholder = 'Ask anything...';
    input.setAttribute('aria-label', 'Chat message input');

    const sendBtn = document.createElement('button');
    sendBtn.className = 'agent-send-btn';
    sendBtn.title = 'Send';
    sendBtn.setAttribute('aria-label', 'Send message');
    const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sendSvg.setAttribute('width', '16');
    sendSvg.setAttribute('height', '16');
    sendSvg.setAttribute('viewBox', '0 0 24 24');
    sendSvg.setAttribute('fill', 'none');
    sendSvg.setAttribute('stroke', 'currentColor');
    sendSvg.setAttribute('stroke-width', '2');
    sendSvg.setAttribute('stroke-linecap', 'round');
    sendSvg.setAttribute('stroke-linejoin', 'round');
    sendSvg.setAttribute('aria-hidden', 'true');
    const sendPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sendPath.setAttribute('d', 'M5 12h14M12 5l7 7-7 7');
    sendSvg.appendChild(sendPath);
    sendBtn.appendChild(sendSvg);

    inputWrapper.appendChild(micBtn);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(sendBtn);

    inputArea.appendChild(voiceBar);
    inputArea.appendChild(inputWrapper);

    chatWindow.appendChild(header);
    chatWindow.appendChild(tabBar);
    chatWindow.appendChild(messages);
    chatWindow.appendChild(historyView);
    chatWindow.appendChild(suggestions);
    chatWindow.appendChild(inputArea);

    // Trigger button
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'agent-trigger-btn';
    triggerBtn.setAttribute('aria-label', 'Open Arctica AI chat');

    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'agent-trigger-icon';
    const triggerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    triggerSvg.setAttribute('width', '22');
    triggerSvg.setAttribute('height', '22');
    triggerSvg.setAttribute('viewBox', '0 0 24 24');
    triggerSvg.setAttribute('fill', 'none');
    triggerSvg.setAttribute('stroke', 'currentColor');
    triggerSvg.setAttribute('stroke-width', '1.5');
    triggerSvg.setAttribute('stroke-linecap', 'round');
    triggerSvg.setAttribute('stroke-linejoin', 'round');
    triggerSvg.setAttribute('aria-hidden', 'true');
    const triggerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    triggerPath.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
    triggerSvg.appendChild(triggerPath);
    triggerIcon.appendChild(triggerSvg);

    const triggerText = document.createElement('span');
    triggerText.className = 'agent-trigger-text';
    triggerText.textContent = 'Talk to Arctica AI';

    triggerBtn.appendChild(triggerIcon);
    triggerBtn.appendChild(triggerText);

    container.appendChild(chatWindow);
    container.appendChild(triggerBtn);

    this.appendChild(container);
  }
}

customElements.define('agent-chat', AgentChat);
