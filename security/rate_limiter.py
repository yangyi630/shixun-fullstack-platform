from fastapi import FastAPI, Request, HTTPException
from config import settings
import time
from collections import defaultdict

# 内存存储，用于限流
rate_limit_store = defaultdict(list)

def setup_rate_limiter(app: FastAPI):
    """为应用设置限流器"""
    pass

def rate_limit(max_requests: int, window_seconds: int = 60):
    """限流装饰器"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host
            current_time = time.time()
            
            # 清理过期的请求记录
            rate_limit_store[client_ip] = [t for t in rate_limit_store[client_ip] if current_time - t < window_seconds]
            
            # 检查是否超过限制
            if len(rate_limit_store[client_ip]) >= max_requests:
                raise HTTPException(status_code=429, detail="请求过于频繁，请稍后再试")
            
            # 记录本次请求
            rate_limit_store[client_ip].append(current_time)
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator

# 限流装饰器
def general_rate_limit():
    """通用限流: 每分钟100次请求"""
    return rate_limit(settings.RATE_LIMIT_GENERAL, 60)

def sensitive_rate_limit():
    """敏感接口限流: 每分钟5次请求"""
    return rate_limit(settings.RATE_LIMIT_SENSITIVE, 60)