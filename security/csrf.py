import secrets
from config import settings
from fastapi import Cookie, Request, Response
from typing import Optional

class CsrfProtection:
    def __init__(self):
        """初始化CSRF保护"""
        self.secret = settings.CSRF_SECRET.encode('utf-8')
    
    def generate_token(self) -> str:
        """生成CSRF token"""
        return secrets.token_hex(32)
    
    def set_token_cookie(self, response: Response, token: str) -> None:
        """设置CSRF token到cookie"""
        response.set_cookie(
            key="csrf_token",
            value=token,
            httponly=False,  # 非httpOnly，允许JS访问
            secure=False,  # 生产环境设为True
            samesite="strict",
            max_age=86400  # 1天
        )
    
    def validate_token(self, request: Request) -> bool:
        """验证CSRF token"""
        # 从header获取token
        header_token = request.headers.get("X-CSRF-Token")
        if not header_token:
            return False
        
        # 从cookie获取token
        cookie_token = request.cookies.get("csrf_token")
        if not cookie_token:
            return False
        
        # 比较token
        return header_token == cookie_token

# 创建实例
csrf_protection = CsrfProtection()