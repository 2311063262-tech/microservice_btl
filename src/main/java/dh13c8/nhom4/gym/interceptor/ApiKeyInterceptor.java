package dh13c8.nhom4.gym.interceptor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interceptor kiểm tra API Key trong header X-API-KEY.
 */
@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    @Value("${app.api.key}")
    private String apiKey;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String key = request.getHeader("X-API-KEY");

        // Kiểm tra API Key
        if (key == null || !key.equals(apiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("API Key invalid or missing");
            return false;
        }

        return true;
    }
}
