# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in StressReliefChat, please report it responsibly:

- **Email**: security@yourdomain.com
- **Response Time**: We aim to respond within 48 hours
- **Disclosure**: Please allow us reasonable time to fix issues before public disclosure

## Security Measures

### Authentication & Authorization

- JWT-based authentication with configurable expiration
- Secure token storage (sessionStorage, never localStorage)
- Token validation on every protected API request
- Optional authentication for public endpoints

### Data Protection

- All passwords hashed with bcrypt (when user auth is implemented)
- Sensitive data never logged to files or console in production
- Environment variables for all secrets
- MongoDB connection encryption in transit

### API Security

1. **Rate Limiting**
   - General API: 100 requests/15 minutes per IP
   - Authentication endpoints: 5 requests/15 minutes per IP
   - Payment endpoints: 10 requests/hour per IP

2. **Input Validation**
   - express-validator for all user inputs
   - Joi schemas for request validation
   - HTML/script tag sanitization
   - SQL injection prevention (using MongoDB ODM)

3. **Security Headers** (via Helmet.js)
   - Content Security Policy (CSP)
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: enabled
   - HSTS: max-age 1 year
   - Referrer-Policy: origin-when-cross-origin

### CORS Configuration

Production CORS settings:
```javascript
{
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### Error Handling

- No sensitive data in error messages
- Generic error messages to users
- Detailed logging for developers (server-side only)
- Stack traces only in development mode

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (already in `.gitignore`)
   - Rotate exposed credentials immediately
   - Use different secrets for dev/staging/production

2. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update vulnerable packages promptly
   - Use `npm audit fix` for automated fixes

3. **Code review**
   - Review all code changes
   - Look for security anti-patterns
   - Validate input handling

4. **Testing**
   - Test authentication flows
   - Test rate limiting
   - Test input validation
   - Test error handling

### For Deployment

1. **Environment Configuration**
   - Use strong, unique JWT secrets (32+ characters)
   - Enable HTTPS/TLS in production
   - Configure firewall rules
   - Whitelist only necessary IP addresses in MongoDB

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor failed authentication attempts
   - Track rate limit violations
   - Regular security audits

3. **Database Security**
   - Use MongoDB Atlas with network restrictions
   - Strong database credentials
   - Regular backups
   - Enable audit logging

4. **Infrastructure**
   - Keep server OS updated
   - Use SSH keys, not passwords
   - Disable root login
  - Configure fail2ban for brute force protection

## Compliance Considerations

### GDPR (for EU users)

- User data deletion on request
- Data export capability
- Clear privacy policy
- Cookie consent (when implemented)
- Data retention policies

### HIPAA (for US healthcare data)

- Encryption at rest and in transit
- Access logging and monitoring
- Business Associate Agreements (BAAs)
- User authentication and authorization
- Regular security assessments

### Mental Health Data

- Extra care for sensitive mental health information
- Secure storage and transmission
- Limited data retention
- Clear user consent
- Anonymization where possible

## Incident Response Plan

### If a breach occurs:

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Assess scope of breach

2. **Mitigation**
   - Patch vulnerability
   - Rotate all credentials
   - Force user password resets (if applicable)

3. **Communication**
   - Notify affected users
   - Report to relevant authorities (if required)
   - Public disclosure (if appropriate)

4. **Post-Incident**
   - Root cause analysis
   - Update security measures
   - Document lessons learned

## Security Checklist

### Before Production Deployment

- [ ] All secrets in environment variables
- [ ] `.env` files not committed to repository
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured (Helmet.js)
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authentication working correctly
- [ ] Error messages don't expose sensitive data
- [ ] Logging configured (no sensitive data logged)
- [ ] Database connection encrypted
- [ ] MongoDB network access restricted
- [ ] Strong database credentials
- [ ] JWT secret is strong and unique
- [ ] Dependencies audited (`npm audit`)
- [ ] Firewall configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy in place
- [ ] Incident response plan documented

## Contact

For security concerns or questions:
- **Security Email**: security@yourdomain.com
- **General Support**: support@yourdomain.com

---

**Last Updated**: February 2026
