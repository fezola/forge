import { Controller, Post, Body } from '@nestjs/common';
import { ExpressionEvaluatorService } from '../application/expression-evaluator.service';

@Controller('expressions')
export class ExpressionController {
  constructor(private readonly expressions: ExpressionEvaluatorService) {}

  @Post('evaluate')
  evaluate(@Body() input: { expression: string; context: Record<string, unknown> }) {
    return this.expressions.evaluate(input.expression, input.context);
  }

  @Post('parse')
  parse(@Body() input: { expression: string }) {
    return this.expressions.parse(input.expression);
  }

  @Post('validate')
  validate(@Body() input: { expression: string }) {
    return { valid: this.expressions.validate(input.expression) };
  }
}
