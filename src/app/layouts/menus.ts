export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  routerLink?: string;
  target?: string;
  type: 'single' | 'accordion' | 'heading';
  children?: MenuItem[];
  exact?: boolean;
  environment?: ('local' | 'stage' | 'prod')[];
}

export const MENU_ITEMS: MenuItem[] = [
  // Dashboard Section
  {
    id: 'dashboard',
    label: 'dashboard',
    icon: 'icon-menu-dashboard',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
			{
				id: 'tickets',
				label: 'Tickets',
				icon: 'icon-menu-dashboard',
				routerLink: '/tickets',
				type: 'single',
				exact: true,
				environment: ['local', 'stage']
			},
      {
        id: 'sales',
        label: 'sales',
        routerLink: '/',
        type: 'single',
        exact: true,
        environment: ['local', 'stage']
      },
      {
        id: 'analytics',
        label: 'analytics',
        routerLink: '/analytics',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'finance',
        label: 'finance',
        routerLink: '/finance',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'crypto',
        label: 'crypto',
        routerLink: '/crypto',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },
	// Tasks Section
	{
    id: 'tickets-heading',
    label: 'Tickets',
    type: 'heading',
    environment: ['local', 'stage', 'prod']
  },
	{
    id: 'tickets',
    label: 'Tickets',
    icon: 'icon-ticket',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
			{
				id: 'kanban-board',
				label: 'Kanban Board',
				routerLink: '/tickets/kanban',
				type: 'single',
				exact: true,
				environment: ['local', 'stage']
			},
			{
				id: 'table-view',
				label: 'Table View',
				routerLink: '/tickets/table',
				type: 'single',
				exact: true,
				environment: ['local', 'stage']
			},
			{
				id: 'approvals',
				label: 'Approvals',
				routerLink: '/tickets/approvals',
				type: 'single',
				exact: true,
				environment: ['local', 'stage']
			}
    ]
  },
  // Apps Heading
  {
    id: 'apps-heading',
    label: 'apps',
    type: 'heading',
    environment: ['local', 'stage']
  },

  // Apps Section
  {
    id: 'chat',
    label: 'chat',
    icon: 'icon-menu-chat',
    routerLink: '/apps/chat',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'mailbox',
    label: 'mailbox',
    icon: 'icon-menu-mailbox',
    routerLink: '/apps/mailbox',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'todolist',
    label: 'todo_list',
    icon: 'icon-menu-todo',
    routerLink: '/apps/todolist',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'notes',
    label: 'notes',
    icon: 'icon-menu-notes',
    routerLink: '/apps/notes',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'scrumboard',
    label: 'scrumboard',
    icon: 'icon-menu-scrumboard',
    routerLink: '/apps/scrumboard',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'contacts',
    label: 'contacts',
    icon: 'icon-menu-contacts',
    routerLink: '/apps/contacts',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'invoice',
    label: 'invoice',
    icon: 'icon-menu-invoice',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'invoice-list',
        label: 'list',
        routerLink: '/apps/invoice/list',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'invoice-preview',
        label: 'preview',
        routerLink: '/apps/invoice/preview',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'invoice-add',
        label: 'add',
        routerLink: '/apps/invoice/add',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'invoice-edit',
        label: 'edit',
        routerLink: '/apps/invoice/edit',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },
  {
    id: 'calendar',
    label: 'calendar',
    icon: 'icon-menu-calendar',
    routerLink: '/apps/calendar',
    type: 'single',
    environment: ['local', 'stage']
  },

  // User Interface Heading
  {
    id: 'user-interface-heading',
    label: 'user_interface',
    type: 'heading',
    environment: ['local', 'stage']
  },

  // Components Section
  {
    id: 'components',
    label: 'components',
    icon: 'icon-menu-components',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'tabs',
        label: 'tabs',
        routerLink: '/components/tabs',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'accordions',
        label: 'accordions',
        routerLink: '/components/accordions',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'modals',
        label: 'modals',
        routerLink: '/components/modals',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'cards',
        label: 'cards',
        routerLink: '/components/cards',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'carousel',
        label: 'carousel',
        routerLink: '/components/carousel',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'countdown',
        label: 'countdown',
        routerLink: '/components/countdown',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'counter',
        label: 'counter',
        routerLink: '/components/counter',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'sweetalert',
        label: 'sweet_alerts',
        routerLink: '/components/sweetalert',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'timeline',
        label: 'timeline',
        routerLink: '/components/timeline',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'notifications',
        label: 'notifications',
        routerLink: '/components/notifications',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'media-object',
        label: 'media_object',
        routerLink: '/components/media-object',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'list-group',
        label: 'list_group',
        routerLink: '/components/list-group',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pricing-table',
        label: 'pricing_tables',
        routerLink: '/components/pricing-table',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'lightbox',
        label: 'lightbox',
        routerLink: '/components/lightbox',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Elements Section
  {
    id: 'elements',
    label: 'elements',
    icon: 'icon-menu-elements',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'alerts',
        label: 'alerts',
        routerLink: '/elements/alerts',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'avatar',
        label: 'avatar',
        routerLink: '/elements/avatar',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'badges',
        label: 'badges',
        routerLink: '/elements/badges',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'breadcrumbs',
        label: 'breadcrumbs',
        routerLink: '/elements/breadcrumbs',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'buttons',
        label: 'buttons',
        routerLink: '/elements/buttons',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'buttons-group',
        label: 'button_groups',
        routerLink: '/elements/buttons-group',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'color-library',
        label: 'color_library',
        routerLink: '/elements/color-library',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'dropdown',
        label: 'dropdown',
        routerLink: '/elements/dropdown',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'infobox',
        label: 'infobox',
        routerLink: '/elements/infobox',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'jumbotron',
        label: 'jumbotron',
        routerLink: '/elements/jumbotron',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'loader',
        label: 'loader',
        routerLink: '/elements/loader',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pagination',
        label: 'pagination',
        routerLink: '/elements/pagination',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'popovers',
        label: 'popovers',
        routerLink: '/elements/popovers',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'progress-bar',
        label: 'progress_bar',
        routerLink: '/elements/progress-bar',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'search',
        label: 'search',
        routerLink: '/elements/search',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'tooltips',
        label: 'tooltips',
        routerLink: '/elements/tooltips',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'treeview',
        label: 'treeview',
        routerLink: '/elements/treeview',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'typography',
        label: 'typography',
        routerLink: '/elements/typography',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Single Menu Items
  {
    id: 'charts',
    label: 'charts',
    icon: 'icon-menu-charts',
    routerLink: '/charts',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'widgets',
    label: 'widgets',
    icon: 'icon-menu-widgets',
    routerLink: '/widgets',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'font-icons',
    label: 'font_icons',
    icon: 'icon-menu-font-icons',
    routerLink: '/font-icons',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'dragndrop',
    label: 'drag_and_drop',
    icon: 'icon-menu-drag-and-drop',
    routerLink: '/dragndrop',
    type: 'single',
    environment: ['local', 'stage']
  },

  // Tables and Forms Heading
  {
    id: 'tables-forms-heading',
    label: 'tables_and_forms',
    type: 'heading',
    environment: ['local', 'stage']
  },

  // Tables Section
  {
    id: 'tables',
    label: 'tables',
    icon: 'icon-menu-tables',
    routerLink: '/tables',
    type: 'single',
    environment: ['local', 'stage']
  },
  {
    id: 'datatables',
    label: 'datatables',
    icon: 'icon-menu-datatables',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'datatables-basic',
        label: 'basic',
        routerLink: '/datatables/basic',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-advanced',
        label: 'advanced',
        routerLink: '/datatables/advanced',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-skin',
        label: 'skin',
        routerLink: '/datatables/skin',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-order-sorting',
        label: 'order_sorting',
        routerLink: '/datatables/order-sorting',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-columns-filter',
        label: 'columns_filter',
        routerLink: '/datatables/columns-filter',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-multi-column',
        label: 'multi_column',
        routerLink: '/datatables/multi-column',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-multiple-tables',
        label: 'multiple_tables',
        routerLink: '/datatables/multiple-tables',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-alt-pagination',
        label: 'alt_pagination',
        routerLink: '/datatables/alt-pagination',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-checkbox',
        label: 'checkbox',
        routerLink: '/datatables/checkbox',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-range-search',
        label: 'range_search',
        routerLink: '/datatables/range-search',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-export',
        label: 'export',
        routerLink: '/datatables/export',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-sticky-header',
        label: 'sticky_header',
        routerLink: '/datatables/sticky-header',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-clone-header',
        label: 'clone_header',
        routerLink: '/datatables/clone-header',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'datatables-column-chooser',
        label: 'column_chooser',
        routerLink: '/datatables/column-chooser',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Forms Section
  {
    id: 'forms',
    label: 'forms',
    icon: 'icon-menu-forms',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'forms-basic',
        label: 'basic',
        routerLink: '/forms/basic',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-input-group',
        label: 'input_group',
        routerLink: '/forms/input-group',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-layouts',
        label: 'layouts',
        routerLink: '/forms/layouts',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-validation',
        label: 'validation',
        routerLink: '/forms/validation',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-input-mask',
        label: 'input_mask',
        routerLink: '/forms/input-mask',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-select2',
        label: 'select2',
        routerLink: '/forms/select2',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-checkbox-radio',
        label: 'checkbox_and_radio',
        routerLink: '/forms/checkbox-radio',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-switches',
        label: 'switches',
        routerLink: '/forms/switches',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-wizards',
        label: 'wizards',
        routerLink: '/forms/wizards',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-file-upload',
        label: 'file_upload',
        routerLink: '/forms/file-upload',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-quill-editor',
        label: 'quill_editor',
        routerLink: '/forms/quill-editor',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-date-picker',
        label: 'date_and_range_picker',
        routerLink: '/forms/date-picker',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'forms-clipboard',
        label: 'clipboard',
        routerLink: '/forms/clipboard',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // User and Pages Heading
  {
    id: 'user-pages-heading',
    label: 'user_and_pages',
    type: 'heading',
    environment: ['local', 'stage']
  },

  // Users Section
  {
    id: 'users',
    label: 'users',
    icon: 'icon-menu-users',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'users-profile',
        label: 'profile',
        routerLink: '/users/profile',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'users-account-settings',
        label: 'account_settings',
        routerLink: '/users/user-account-settings',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Pages Section
  {
    id: 'pages',
    label: 'pages',
    icon: 'icon-menu-pages',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'pages-knowledge-base',
        label: 'knowledge_base',
        routerLink: '/pages/knowledge-base',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pages-contact-us-boxed',
        label: 'contact_us_boxed',
        routerLink: '/pages/contact-us-boxed',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pages-contact-us-cover',
        label: 'contact_us_cover',
        routerLink: '/pages/contact-us-cover',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pages-faq',
        label: 'faq',
        routerLink: '/pages/faq',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pages-coming-soon-boxed',
        label: 'coming_soon_boxed',
        routerLink: '/pages/coming-soon-boxed',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'pages-coming-soon-cover',
        label: 'coming_soon_cover',
        routerLink: '/pages/coming-soon-cover',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'error',
        label: 'error',
        type: 'accordion',
        environment: ['local', 'stage'],
        children: [
          {
            id: 'error-404',
            label: '404',
            routerLink: '/pages/error404',
            target: '_blank',
            type: 'single',
            environment: ['local', 'stage']
          },
          {
            id: 'error-500',
            label: '500',
            routerLink: '/pages/error500',
            target: '_blank',
            type: 'single',
            environment: ['local', 'stage']
          },
          {
            id: 'error-503',
            label: '503',
            routerLink: '/pages/error503',
            target: '_blank',
            type: 'single',
            environment: ['local', 'stage']
          }
        ]
      },
      {
        id: 'pages-maintenence',
        label: 'maintenence',
        routerLink: '/pages/maintenence',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Authentication Section
  {
    id: 'authentication',
    label: 'authentication',
    icon: 'icon-menu-authentication',
    type: 'accordion',
    environment: ['local', 'stage'],
    children: [
      {
        id: 'auth-boxed-signin',
        label: 'login_boxed',
        routerLink: '/auth/boxed-signin',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-boxed-signup',
        label: 'register_boxed',
        routerLink: '/auth/boxed-signup',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-boxed-lockscreen',
        label: 'unlock_boxed',
        routerLink: '/auth/boxed-lockscreen',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-boxed-password-reset',
        label: 'recover_id_boxed',
        routerLink: '/auth/boxed-password-reset',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-cover-login',
        label: 'login_cover',
        routerLink: '/auth/cover-login',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-cover-register',
        label: 'register_cover',
        routerLink: '/auth/cover-register',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-cover-lockscreen',
        label: 'unlock_cover',
        routerLink: '/auth/cover-lockscreen',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      },
      {
        id: 'auth-cover-password-reset',
        label: 'recover_id_cover',
        routerLink: '/auth/cover-password-reset',
        target: '_blank',
        type: 'single',
        environment: ['local', 'stage']
      }
    ]
  },

  // Supports Heading
  {
    id: 'supports-heading',
    label: 'supports',
    type: 'heading',
    environment: ['local', 'stage']
  },

  // Documentation
  {
    id: 'documentation',
    label: 'documentation',
    icon: 'icon-menu-documentation',
    routerLink: 'https://vristo.sbthemes.com',
    target: '_blank',
    type: 'single',
    environment: ['local', 'stage']
  }
];