const op = ({
  summary,
  tags,
  secured = true,
  parameters = [],
  requestBody = undefined,
  responses = undefined
}) => {
  const result = {
    summary,
    tags,
    parameters,
    responses: responses || {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: true
            }
          }
        }
      }
    }
  };

  if (secured) {
    result.security = [{ bearerAuth: [] }];
  }

  if (requestBody) {
    result.requestBody = requestBody;
  }

  return result;
};

const body = (properties, required = []) => ({
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties,
        required
      }
    }
  }
});

const arrayResponse = {
  200: {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true
          }
        }
      }
    }
  }
};

const okResponse = {
  200: {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: true
        }
      }
    }
  }
};

const p = (name, description, example = 'sample-value') => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', example }
});

const q = (name, description, example = 'sample-value') => ({
  name,
  in: 'query',
  required: false,
  description,
  schema: { type: 'string', example }
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Web3 HR Management API',
    version: '1.0.0',
    description: 'Interactive API documentation for the current backend.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  tags: [
    { name: 'Auth' },
    { name: 'Roles' },
    { name: 'Departments' },
    { name: 'Employees' },
    { name: 'Attendance' },
    { name: 'Attendance Admin' },
    { name: 'Logs' },
    { name: 'Payroll' },
    { name: 'QR' },
    { name: 'Consent' },
    { name: 'Tasks' },
    { name: 'Tasks Files' },
    { name: 'Tasks Bulk' },
    { name: 'Tasks Multi-day' },
    { name: 'KPI' },
    { name: 'Employee Rewards' }
  ],
  paths: {
    '/': {
      get: op({
        summary: 'Root health endpoint',
        tags: ['Auth'],
        secured: false,
        responses: {
          200: {
            description: 'Plain text status',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'Web3 HR Management API is running...'
                }
              }
            }
          }
        }
      })
    },
    '/api/auth/challenge': {
      post: op({
        summary: 'Create wallet login challenge',
        tags: ['Auth'],
        secured: false,
        requestBody: body({
          walletAddress: { type: 'string', example: '0xf56ca4437a2c3ae3a594ff8a2dd9aed8ec3f1289' }
        }, ['walletAddress']),
        responses: okResponse
      })
    },
    '/api/auth/verify': {
      post: op({
        summary: 'Verify signed challenge and issue JWT',
        tags: ['Auth'],
        secured: false,
        requestBody: body({
          challengeId: { type: 'string', example: 'challenge-id' },
          signature: { type: 'string', example: '0xsignature' },
          consentTransactionHash: { type: 'string', nullable: true, example: '0xconsenttx' }
        }, ['challengeId', 'signature']),
        responses: okResponse
      })
    },
    '/api/auth/logout': {
      post: op({ summary: 'Logout current user', tags: ['Auth'] })
    },
    '/api/auth/profile': {
      get: op({ summary: 'Get current profile', tags: ['Auth'] })
    },
    '/api/roles': {
      get: op({ summary: 'Get all roles', tags: ['Roles'], responses: arrayResponse }),
      post: op({
        summary: 'Create role',
        tags: ['Roles'],
        requestBody: body({
          ten_vai_tro: { type: 'string', example: 'Employee' },
          mo_ta: { type: 'string', example: 'Basic employee role' }
        })
      })
    },
    '/api/roles/{role_id}': {
      get: op({ summary: 'Get role by id', tags: ['Roles'], parameters: [p('role_id', 'Role identifier')] }),
      put: op({
        summary: 'Update role by id',
        tags: ['Roles'],
        parameters: [p('role_id', 'Role identifier')],
        requestBody: body({
          ten_vai_tro: { type: 'string', example: 'Manager' },
          trang_thai: { type: 'string', example: 'Hoạt động' }
        })
      }),
      delete: op({ summary: 'Delete role by id', tags: ['Roles'], parameters: [p('role_id', 'Role identifier')] })
    },
    '/api/roles/permissions/me': {
      get: op({ summary: 'Get current user permissions', tags: ['Roles'] })
    },
    '/api/departments': {
      get: op({ summary: 'Get all departments', tags: ['Departments'], secured: false, responses: arrayResponse }),
      post: op({
        summary: 'Create department',
        tags: ['Departments'],
        requestBody: body({
          ten_phong_ban: { type: 'string', example: 'Phòng Kinh Doanh' },
          mo_ta: { type: 'string', example: 'Mô tả phòng ban' }
        })
      })
    },
    '/api/departments/{id}': {
      get: op({ summary: 'Get department by id', tags: ['Departments'], secured: false, parameters: [p('id', 'Department id')] }),
      put: op({
        summary: 'Update department',
        tags: ['Departments'],
        parameters: [p('id', 'Department id')],
        requestBody: body({
          ten_phong_ban: { type: 'string', example: 'Phòng Kinh Doanh' }
        })
      }),
      delete: op({ summary: 'Delete department', tags: ['Departments'], parameters: [p('id', 'Department id')] })
    },
    '/api/departments/{id}/assign-employee': {
      post: op({
        summary: 'Assign employee to department',
        tags: ['Departments'],
        parameters: [p('id', 'Department id')],
        requestBody: body({
          employee_did: { type: 'string', example: '044822b4-25d7-43d3-98e4-193dd0f179fc' }
        }, ['employee_did'])
      })
    },
    '/api/departments/remove-employee/{employeeDid}': {
      delete: op({
        summary: 'Remove employee from department',
        tags: ['Departments'],
        parameters: [p('employeeDid', 'Employee DID')]
      })
    },
    '/api/employees': {
      get: op({ summary: 'Get all employees', tags: ['Employees'], responses: arrayResponse }),
      post: op({
        summary: 'Create employee',
        tags: ['Employees'],
        requestBody: body({
          employee_did: { type: 'string', example: 'employee-did' },
          chuc_vu: { type: 'string', example: 'Intern' },
          walletAddress: { type: 'string', example: '0x1111111111111111111111111111111111111111' }
        })
      })
    },
    '/api/employees/department/{departmentId}': {
      get: op({ summary: 'Get employees by department', tags: ['Employees'], parameters: [p('departmentId', 'Department id')], responses: arrayResponse })
    },
    '/api/employees/wallet/{walletAddress}': {
      get: op({ summary: 'Get employee by wallet', tags: ['Employees'], parameters: [p('walletAddress', 'Wallet address')] })
    },
    '/api/employees/{id}': {
      get: op({ summary: 'Get employee by id', tags: ['Employees'], parameters: [p('id', 'Employee id or DID')] }),
      put: op({
        summary: 'Update employee',
        tags: ['Employees'],
        parameters: [p('id', 'Employee id or DID')],
        requestBody: body({
          chuc_vu: { type: 'string', example: 'Manager' },
          phong_ban_id: { type: 'string', example: '3d868e1f-2f53-4819-8ef6-b4af62fbb7b2' }
        })
      }),
      delete: op({ summary: 'Delete employee', tags: ['Employees'], parameters: [p('id', 'Employee id or DID')] })
    },
    '/api/employees/{id}/wallet': {
      put: op({
        summary: 'Update employee wallet',
        tags: ['Employees'],
        parameters: [p('id', 'Employee id or DID')],
        requestBody: body({
          walletAddress: { type: 'string', example: '0xf56ca4437a2c3ae3a594ff8a2dd9aed8ec3f1289' }
        }, ['walletAddress'])
      })
    },
    '/api/attendance': {
      get: op({ summary: 'Get all attendance records', tags: ['Attendance'], responses: arrayResponse }),
      post: op({
        summary: 'Create attendance record',
        tags: ['Attendance'],
        requestBody: body({
          employee_did: { type: 'string', example: '044822b4-25d7-43d3-98e4-193dd0f179fc' },
          ngay: { type: 'string', format: 'date', example: '2026-03-29' },
          gio_vao: { type: 'string', example: '08:00:00' }
        })
      })
    },
    '/api/attendance/{id}': {
      get: op({ summary: 'Get attendance by id', tags: ['Attendance'], parameters: [p('id', 'Attendance id')] }),
      put: op({
        summary: 'Update attendance by id',
        tags: ['Attendance'],
        parameters: [p('id', 'Attendance id')],
        requestBody: body({
          gio_ra: { type: 'string', example: '17:00:00' },
          ghi_chu: { type: 'string', example: 'Updated' }
        })
      }),
      delete: op({ summary: 'Delete attendance by id', tags: ['Attendance'], parameters: [p('id', 'Attendance id')] })
    },
    '/api/attendance/employee/{employeeDid}': {
      get: op({
        summary: 'Get attendance by employee',
        tags: ['Attendance'],
        secured: false,
        parameters: [
          p('employeeDid', 'Employee DID'),
          q('startDate', 'Filter start date', '2026-03-01'),
          q('endDate', 'Filter end date', '2026-03-31'),
          q('loai_ngay', 'Day type filter', 'Ngày thường')
        ],
        responses: arrayResponse
      })
    },
    '/api/attendance/date-range': {
      get: op({
        summary: 'Get attendance by date range',
        tags: ['Attendance'],
        parameters: [q('startDate', 'Start date', '2026-03-01'), q('endDate', 'End date', '2026-03-31')],
        responses: arrayResponse
      })
    },
    '/api/attendance/employee/{employeeDid}/date/{date}': {
      get: op({
        summary: 'Get attendance by employee and date',
        tags: ['Attendance'],
        parameters: [p('employeeDid', 'Employee DID'), p('date', 'Date', '2026-03-29')]
      })
    },
    '/api/attendance/checkin': {
      post: op({
        summary: 'Check in',
        tags: ['Attendance'],
        requestBody: body({
          employee_did: { type: 'string', example: '044822b4-25d7-43d3-98e4-193dd0f179fc' },
          ngay: { type: 'string', format: 'date', example: '2026-03-29' },
          gio_vao: { type: 'string', example: '08:10:00' },
          xac_thuc_qua: { type: 'string', example: 'Web App' }
        })
      })
    },
    '/api/attendance/checkout': {
      post: op({
        summary: 'Check out',
        tags: ['Attendance'],
        requestBody: body({
          employee_did: { type: 'string', example: '044822b4-25d7-43d3-98e4-193dd0f179fc' },
          ngay: { type: 'string', format: 'date', example: '2026-03-29' },
          gio_ra: { type: 'string', example: '17:20:00' },
          xac_thuc_qua: { type: 'string', example: 'Web App' }
        })
      })
    },
    '/api/attendance/{id}/pay': {
      post: op({ summary: 'Pay attendance record', tags: ['Attendance'], parameters: [p('id', 'Attendance id')] })
    },
    '/api/attendance/report-missed-checkout': {
      post: op({
        summary: 'Report missed checkout',
        tags: ['Attendance'],
        requestBody: body({
          employee_did: { type: 'string', example: '044822b4-25d7-43d3-98e4-193dd0f179fc' },
          ngay: { type: 'string', format: 'date', example: '2026-03-29' },
          mo_ta: { type: 'string', example: 'Forgot to check out' }
        })
      })
    },
    '/api/attendance/admin/manual': {
      post: op({ summary: 'Admin create manual attendance', tags: ['Attendance Admin'], requestBody: body({ employee_did: { type: 'string', example: 'employee-did' } }) })
    },
    '/api/attendance/admin/{id}': {
      put: op({ summary: 'Admin update attendance', tags: ['Attendance Admin'], parameters: [p('id', 'Attendance id')], requestBody: body({ ghi_chu: { type: 'string', example: 'Updated by admin' } }) })
    },
    '/api/attendance/admin/approve/{id}': {
      post: op({ summary: 'Admin approve attendance', tags: ['Attendance Admin'], parameters: [p('id', 'Attendance id')], requestBody: body({ ly_do_phe_duyet: { type: 'string', example: 'Approved' } }) })
    },
    '/api/attendance/admin/approve-overtime/{id}': {
      post: op({ summary: 'Admin approve overtime', tags: ['Attendance Admin'], parameters: [p('id', 'Attendance id')], requestBody: body({ ly_do_lam_them: { type: 'string', example: 'Approved overtime' } }) })
    },
    '/api/attendance/admin/approve-leave/{id}': {
      post: op({ summary: 'Admin approve leave', tags: ['Attendance Admin'], parameters: [p('id', 'Attendance id')], requestBody: body({ ly_do_nghi: { type: 'string', example: 'Approved leave' } }) })
    },
    '/api/attendance/admin/missed-checkout/{id}': {
      post: op({ summary: 'Admin approve missed checkout', tags: ['Attendance Admin'], parameters: [p('id', 'Attendance id')], requestBody: body({ approve: { type: 'boolean', example: true } }) })
    },
    '/api/attendance/admin/bulk-update': {
      post: op({ summary: 'Admin bulk update attendance', tags: ['Attendance Admin'], requestBody: body({ records: { type: 'array', items: { type: 'object', additionalProperties: true } } }) })
    },
    '/api/attendance/admin/pending-approvals': {
      get: op({ summary: 'Get pending attendance approvals', tags: ['Attendance Admin'], responses: arrayResponse })
    },
    '/api/attendance/admin/report': {
      get: op({ summary: 'Get attendance report', tags: ['Attendance Admin'], parameters: [q('startDate', 'Start date', '2026-03-01'), q('endDate', 'End date', '2026-03-31')], responses: arrayResponse })
    },
    '/api/logs/contracts/attendance/{recordId}': {
      get: op({ summary: 'Get smart contract logs for attendance', tags: ['Logs'], secured: false, parameters: [p('recordId', 'Attendance record id')], responses: arrayResponse })
    },
    '/api/kpi/stats': {
      get: op({ summary: 'Get KPI stats', tags: ['KPI'], secured: false })
    },
    '/api/kpi/stats/dashboard': {
      get: op({ summary: 'Get KPI dashboard stats', tags: ['KPI'], secured: false })
    },
    '/api/payroll/contract-info': {
      get: op({ summary: 'Get payroll contract info', tags: ['Payroll'] })
    },
    '/api/payroll/deposit': {
      post: op({ summary: 'Deposit tokens to payroll contract', tags: ['Payroll'], requestBody: body({ amount: { type: 'number', example: 1000 } }, ['amount']) })
    },
    '/api/logs/contracts': {
      get: op({ summary: 'Get all smart contract logs', tags: ['Logs'], secured: false, responses: arrayResponse }),
      post: op({ summary: 'Create smart contract log', tags: ['Logs'], secured: false, requestBody: body({ contract_address: { type: 'string', example: '0xcontract' }, transaction_hash: { type: 'string', example: '0xtxhash' } }) })
    },
    '/api/logs/contracts/{id}': {
      get: op({ summary: 'Get smart contract log by id', tags: ['Logs'], secured: false, parameters: [p('id', 'Log id or tx hash')] })
    },
    '/api/qr': {
      get: op({ summary: 'Get all QR records', tags: ['QR'], secured: false, responses: arrayResponse }),
      post: op({ summary: 'Create QR record', tags: ['QR'], secured: false, requestBody: body({ employee_did: { type: 'string', example: 'employee-did' }, walletAddress: { type: 'string', example: '0xwallet' } }) })
    },
    '/api/qr/{id}': {
      get: op({ summary: 'Get QR record by id', tags: ['QR'], secured: false, parameters: [p('id', 'QR record id')] }),
      put: op({ summary: 'Update QR record', tags: ['QR'], secured: false, parameters: [p('id', 'QR record id')], requestBody: body({ trang_thai: { type: 'string', example: 'Hoạt động' } }) }),
      delete: op({ summary: 'Delete QR record', tags: ['QR'], secured: false, parameters: [p('id', 'QR record id')] })
    },
    '/api/qr/employee/{employeeDid}': {
      get: op({ summary: 'Get QR by employee', tags: ['QR'], secured: false, parameters: [p('employeeDid', 'Employee DID')] })
    },
    '/api/qr/generate/{employeeDid}': {
      post: op({ summary: 'Generate QR for employee', tags: ['QR'], secured: false, parameters: [p('employeeDid', 'Employee DID')], requestBody: body({ walletAddress: { type: 'string', example: '0xwallet' } }) })
    },
    '/api/qr/validate-login': {
      post: op({ summary: 'Validate QR for login', tags: ['QR'], secured: false, requestBody: body({ qr_code_id: { type: 'string', example: 'qr-id' }, qr_hash: { type: 'string', example: 'hash' } }) })
    },
    '/api/qr/revoke/{id}': {
      put: op({ summary: 'Revoke QR record', tags: ['QR'], secured: false, parameters: [p('id', 'QR record id')] })
    },
    '/api/qr/welcome': {
      get: op({ summary: 'QR welcome endpoint', tags: ['QR'], secured: false })
    },
    '/api/consent': {
      post: op({ summary: 'Create consent', tags: ['Consent'], requestBody: body({ consentType: { type: 'string', example: 'profile_access' }, ipfsHash: { type: 'string', example: 'QmHash' } }) })
    },
    '/api/consent/{consentId}/revoke': {
      put: op({ summary: 'Revoke consent', tags: ['Consent'], parameters: [p('consentId', 'Consent id')] })
    },
    '/api/consent/{consentId}/valid': {
      get: op({ summary: 'Check consent validity', tags: ['Consent'], parameters: [p('consentId', 'Consent id')] })
    },
    '/api/consent/employee/{employeeDid}/type/{consentType}/active': {
      get: op({ summary: 'Check active consent by employee and type', tags: ['Consent'], parameters: [p('employeeDid', 'Employee DID'), p('consentType', 'Consent type', 'profile_access')] })
    },
    '/api/consent/employee/{employeeDid}': {
      get: op({ summary: 'Get consent list by employee', tags: ['Consent'], parameters: [p('employeeDid', 'Employee DID')], responses: arrayResponse })
    },
    '/api/consent/{consentId}': {
      get: op({ summary: 'Get consent details', tags: ['Consent'], parameters: [p('consentId', 'Consent id')] })
    },
    '/api/logs/events/test/{userDid}': {
      get: op({ summary: 'Test get event logs without auth', tags: ['Logs'], secured: false, parameters: [p('userDid', 'User DID')], responses: arrayResponse })
    },
    '/api/logs/events': {
      get: op({ summary: 'Get all event logs', tags: ['Logs'], secured: false, responses: arrayResponse }),
      post: op({ summary: 'Create event log', tags: ['Logs'], secured: false, requestBody: body({ user_did: { type: 'string', example: 'employee-did' }, event_type: { type: 'string', example: 'login' }, message: { type: 'string', example: 'Logged in successfully' }, timestamp: { type: 'string', format: 'date-time', example: '2026-03-29T10:00:00.000Z' } }) })
    },
    '/api/logs/events/read/{userDid}': {
      delete: op({ summary: 'Delete read notifications', tags: ['Logs'], secured: false, parameters: [p('userDid', 'User DID')] })
    },
    '/api/logs/events/all/{userDid}': {
      delete: op({ summary: 'Delete all notifications', tags: ['Logs'], secured: false, parameters: [p('userDid', 'User DID')] })
    },
    '/api/logs/events/delete/{id}': {
      delete: op({ summary: 'Delete event by id', tags: ['Logs'], secured: false, parameters: [p('id', 'Event id')] })
    },
    '/api/logs/events/{userDid}': {
      get: op({ summary: 'Get events by user', tags: ['Logs'], secured: false, parameters: [p('userDid', 'User DID')], responses: arrayResponse })
    },
    '/api/logs/events/{id}': {
      put: op({ summary: 'Mark event as read', tags: ['Logs'], secured: false, parameters: [p('id', 'Event id')], requestBody: body({ is_read: { type: 'boolean', example: true } }) })
    },
    '/api/tasks': {
      get: op({ summary: 'Get all tasks', tags: ['Tasks'], responses: arrayResponse }),
      post: op({ summary: 'Create task', tags: ['Tasks'], requestBody: body({ ten_cong_viec: { type: 'string', example: 'Prepare weekly report' }, nguoi_giao_did: { type: 'string', example: 'manager-did' }, nguoi_thuc_hien_did: { type: 'string', example: 'employee-did' }, trang_thai: { type: 'string', example: 'Chờ bắt đầu' }, ngay_bat_dau: { type: 'string', format: 'date-time' }, ngay_ket_thuc_du_kien: { type: 'string', format: 'date-time' } }) })
    },
    '/api/tasks/employee/{employeeDid}': {
      get: op({ summary: 'Get tasks by employee', tags: ['Tasks'], parameters: [p('employeeDid', 'Employee DID'), q('includePending', 'Include pending tasks', 'true')], responses: arrayResponse })
    },
    '/api/tasks/employee/{employeeDid}/pending': {
      get: op({ summary: 'Get pending tasks by employee', tags: ['Tasks'], parameters: [p('employeeDid', 'Employee DID')], responses: arrayResponse })
    },
    '/api/employee/kpi-rewards/{employeeDid}': {
      get: op({ summary: 'Get employee KPI rewards', tags: ['Employee Rewards'], parameters: [p('employeeDid', 'Employee DID')] })
    },
    '/api/tasks/assigner/{assignerDid}': {
      get: op({ summary: 'Get tasks by assigner', tags: ['Tasks'], parameters: [p('assignerDid', 'Assigner DID')], responses: arrayResponse })
    },
    '/api/tasks/status/{status}': {
      get: op({ summary: 'Get tasks by status', tags: ['Tasks'], parameters: [p('status', 'Task status', 'Đang thực hiện')], responses: arrayResponse })
    },
    '/api/tasks/priority/{priority}': {
      get: op({ summary: 'Get tasks by priority', tags: ['Tasks'], parameters: [p('priority', 'Task priority', 'Cao')], responses: arrayResponse })
    },
    '/api/tasks/department/{departmentId}': {
      get: op({ summary: 'Get tasks by department', tags: ['Tasks'], parameters: [p('departmentId', 'Department id')], responses: arrayResponse })
    },
    '/api/tasks/overdue': {
      get: op({ summary: 'Get overdue tasks', tags: ['Tasks'], responses: arrayResponse })
    },
    '/api/tasks/stats': {
      get: op({ summary: 'Get task stats', tags: ['Tasks'] })
    },
    '/api/tasks/stats/detailed': {
      get: op({ summary: 'Get detailed task stats', tags: ['Tasks'] })
    },
    '/api/tasks/multi-day': {
      get: op({ summary: 'Get multi-day tasks', tags: ['Tasks Multi-day'], parameters: [q('employee_did', 'Employee DID'), q('start_date', 'Start date', '2026-03-01'), q('end_date', 'End date', '2026-03-31')] })
    },
    '/api/tasks/multi-day/calculate-average': {
      post: op({ summary: 'Calculate average completion rate', tags: ['Tasks Multi-day'], requestBody: body({ employee_did: { type: 'string', example: 'employee-did' }, start_date: { type: 'string', example: '2026-03-01' }, end_date: { type: 'string', example: '2026-03-31' }, auto_pay: { type: 'boolean', example: false } }) })
    },
    '/api/tasks/multi-day/{taskId}/calculate': {
      post: op({ summary: 'Calculate KPI for multi-day task', tags: ['Tasks Multi-day'], parameters: [p('taskId', 'Task id')], requestBody: body({ auto_pay: { type: 'boolean', example: true } }) })
    },
    '/api/tasks/multi-day/bulk-calculate': {
      post: op({ summary: 'Bulk calculate multi-day KPI', tags: ['Tasks Multi-day'], requestBody: body({ task_ids: { type: 'array', items: { type: 'string' }, example: ['task-1', 'task-2'] }, auto_pay: { type: 'boolean', example: true } }) })
    },
    '/api/tasks/upload': {
      post: op({
        summary: 'Upload single file',
        tags: ['Tasks Files'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        }
      })
    },
    '/api/tasks/test-upload-route': {
      get: op({ summary: 'Test upload route', tags: ['Tasks Files'], secured: false })
    },
    '/api/tasks/upload-multiple': {
      post: op({
        summary: 'Upload multiple files',
        tags: ['Tasks Files'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          }
        }
      })
    },
    '/api/tasks/bulk': {
      post: op({ summary: 'Bulk create tasks', tags: ['Tasks Bulk'], requestBody: body({ tasks: { type: 'array', items: { type: 'object', additionalProperties: true } } }) }),
      put: op({ summary: 'Bulk update tasks', tags: ['Tasks Bulk'], requestBody: body({ task_ids: { type: 'array', items: { type: 'string' } }, updates: { type: 'object', additionalProperties: true } }) }),
      delete: op({ summary: 'Bulk delete tasks', tags: ['Tasks Bulk'], requestBody: body({ task_ids: { type: 'array', items: { type: 'string' } } }) })
    },
    '/api/tasks/{task_id}/accept': {
      post: op({ summary: 'Accept task', tags: ['Tasks'], parameters: [p('task_id', 'Task id')] })
    },
    '/api/tasks/{task_id}/attach': {
      post: op({ summary: 'Attach files to task', tags: ['Tasks Files'], parameters: [p('task_id', 'Task id')], requestBody: body({ files: { type: 'array', items: { type: 'object', additionalProperties: true } } }) })
    },
    '/api/tasks/{task_id}/ai-insights': {
      post: op({ summary: 'Generate AI insights for task', tags: ['Tasks'], parameters: [p('task_id', 'Task id')] })
    },
    '/api/tasks/files/{filename}': {
      get: op({
        summary: 'Download task file',
        tags: ['Tasks Files'],
        parameters: [p('filename', 'Stored filename')],
        responses: {
          200: {
            description: 'Binary file response',
            content: {
              'application/octet-stream': {
                schema: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      })
    },
    '/api/tasks/{task_id}/files/{file_uri}': {
      delete: op({ summary: 'Delete file from task', tags: ['Tasks Files'], parameters: [p('task_id', 'Task id'), p('file_uri', 'Encoded file uri', 'sample-file-uri')] })
    },
    '/api/tasks/{id}/progress': {
      put: op({ summary: 'Update task progress', tags: ['Tasks'], parameters: [p('id', 'Task id')], requestBody: body({ tien_do: { type: 'number', example: 50 }, note: { type: 'string', example: 'Progress updated' }, files: { type: 'array', items: { type: 'object', additionalProperties: true } } }) })
    },
    '/api/tasks/approve-progress-milestone': {
      post: op({ summary: 'Approve progress milestone', tags: ['Tasks'], requestBody: body({ task_id: { type: 'string', example: 'task-id' }, milestone: { type: 'number', example: 50 }, approve: { type: 'boolean', example: true }, admin_note: { type: 'string', example: 'Approved' } }) })
    },
    '/api/tasks/{id}/approve': {
      put: op({ summary: 'Approve task', tags: ['Tasks'], parameters: [p('id', 'Task id')], requestBody: body({ approve: { type: 'boolean', example: true }, admin_note: { type: 'string', example: 'Approved by manager' } }) })
    },
    '/api/tasks/{id}': {
      get: op({ summary: 'Get task by id', tags: ['Tasks'], parameters: [p('id', 'Task id')] }),
      put: op({ summary: 'Update task by id', tags: ['Tasks'], parameters: [p('id', 'Task id')], requestBody: body({ trang_thai: { type: 'string', example: 'Đang thực hiện' }, tien_do: { type: 'number', example: 75 } }) }),
      delete: op({ summary: 'Delete task by id', tags: ['Tasks'], parameters: [p('id', 'Task id')] })
    }
  }
};
