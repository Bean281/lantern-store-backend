import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto, RegisterDto, AuthResponseDto, LogoutResponseDto, MeResponseDto } from "./dto";
import { JwtGuard } from "./guard";
import { GetUser } from "./decorate";

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created', type: AuthResponseDto })
    @ApiResponse({ status: 403, description: 'Credentials taken' })
    @ApiBody({ type: RegisterDto })
    register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.signup(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with credentials' })
    @ApiResponse({ status: 200, description: 'User successfully authenticated', type: AuthResponseDto })
    @ApiResponse({ status: 403, description: 'Credentials incorrect' })
    @ApiBody({ type: AuthDto })
    login(@Body() dto: AuthDto): Promise<AuthResponseDto> {
        return this.authService.signin(dto);
    }

    @Post('logout')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'User successfully logged out', type: LogoutResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    logout(): Promise<LogoutResponseDto> {
        return this.authService.logout();
    }

    @Get('me')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user info' })
    @ApiResponse({ status: 200, description: 'Current user information', type: MeResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    me(@GetUser('id') userId: string): Promise<MeResponseDto> {
        return this.authService.getMe(userId);
    }
} 