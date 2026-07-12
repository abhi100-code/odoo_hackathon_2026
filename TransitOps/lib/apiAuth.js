import { verifyToken } from './auth';

export function getAuthUser(request, allowedRoles = []) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return { error: 'Forbidden: Insufficient permissions', status: 403 };
  }

  return { user: decoded };
}
