# OpenRouter.ai Setup Guide for Nomie

## What is OpenRouter?

[OpenRouter](https://openrouter.ai) is a unified API that provides access to multiple large language models (LLMs) from a single endpoint. Instead of managing separate API keys for Claude, GPT-4, Llama, Mistral, and other models, you can use one OpenRouter API key to access all of them.

**Key benefits:**
- Access to 100+ LLMs (Claude, GPT-4, Llama, Mistral, etc.)
- Unified API - single endpoint for all models
- Pay-as-you-go pricing with competitive rates
- Model fallbacks if primary model is unavailable
- Same prompt/response format across all models
- Transparent pricing and usage tracking

---

## Step 1: Create an OpenRouter Account

### Sign Up

1. Visit [openrouter.ai](https://openrouter.ai)
2. Click **"Sign in"** in the top right
3. Choose your sign-up method:
   - Email/Password
   - Google
   - GitHub
4. Complete the sign-up process

### Create an API Key

1. After signing in, click your **Profile** (top right)
2. Go to **API Keys** section
3. Click **"Create new key"**
4. Give it a name (e.g., "Nomie")
5. Copy the API key immediately - **you won't see it again**
6. Store it securely

**Important:** Never share your API key or commit it to version control!

---

## Step 2: Add OpenRouter to Nomie

### Enable AI Integration with OpenRouter

1. Open Nomie Settings
2. Navigate to **More Settings → AI Integration**
3. Enable **AI Features** toggle
4. In the service selector, choose **OpenRouter**
5. Paste your API key in the **API Key** field
6. **Strongly recommended**: Set a PIN in **More Settings → Security → Use PIN** to encrypt your API key
7. Click **Save Configuration**

**Success indicators:**
- ✅ "API key is encrypted with your PIN" message appears (if PIN is set)
- ✅ Service selector shows "Using openrouter"
- ✅ AI features (Insight widget, AI Chat) are now enabled

---

## Step 3: Understand Available Models

OpenRouter provides access to many models. Here's what you should know:

### Popular Models for Nomie

| Model | Provider | Speed | Cost | Best For |
|-------|----------|-------|------|----------|
| `openai/gpt-3.5-turbo` | OpenAI | Very Fast | Lowest | Budget-conscious, general use |
| `openai/gpt-4` | OpenAI | Medium | High | Complex analysis, better accuracy |
| `anthropic/claude-3.5-sonnet` | Anthropic | Medium | Medium | Best quality for insights |
| `anthropic/claude-3-opus` | Anthropic | Slower | High | Most capable Claude model |
| `meta-llama/llama-3-70b` | Meta | Fast | Low | Open-source alternative |
| `mistralai/mistral-large` | Mistral | Fast | Low | Balanced performance |

### Current Nomie Default

Nomie is configured with **`openrouter/free`** - OpenRouter's official free tier endpoint:
- ✅ **Officially free** - Designed for free tier users
- ✅ **Auto-selects** - Picks the best available free model automatically
- ⚠️ **Rate limit** - 50 requests per day
- ⚠️ **To unlock 1000 req/day** - Purchase $10+ in credits (even if unused, just unlocks the tier)

**How it works:**
1. OpenRouter has two access tiers for free models:
   - **Free tier (default)**: 50 requests/day, no payment needed
   - **Free models (unlocked)**: 1000 requests/day, requires $10+ purchase (which upgrades your account)
2. Even though you add a payment method, you stay on the 50 req/day tier until you make a $10 purchase
3. Purchase doesn't need to be used - just buying $10 in credits unlocks the higher limit

### Available Free Models

OpenRouter provides several free models you can use:

**Using the Free Router (Nomie default):**
- **`openrouter/free`** ⭐ **Currently used** - Auto-selects best available free model

**Specific Free Models** (with `:free` suffix):
- `google/gemini-2.0-flash-exp:free` - Google's Gemini Flash
- Other models with `:free` suffix (check [openrouter.ai/models](https://openrouter.ai/models))

**These require payment** (won't work with free tier):
- Any model without `:free` suffix
- `openrouter/auto` - Premium auto-routing
- Claude, GPT-4, other commercial models

### Changing Models (Advanced)

To use a specific free model instead of `openrouter/free`:

1. Go to [openrouter.ai/models](https://openrouter.ai/models)
2. Find a model ending in `:free`
3. Edit `src/domains/ai/services/openrouter.ts`
4. Change `openrouter/free` to your chosen model ID
5. Rebuild and restart Nomie

Example: Change to `google/gemini-2.0-flash-exp:free`

---

## Pricing

### Nomie Uses Free Models

Nomie is configured to use **OpenRouter's free models only**, which means:

- **Zero Cost** - No charges for using the AI features
- **No Rate Limits on Pricing** - You won't incur unexpected charges
- **API Rate Limits** - Subject to OpenRouter's fair-use limits (typically 20 requests/minute)

### How Free Models Work

Nomie uses OpenRouter's `openrouter/free` endpoint:
- **Official free tier** - Designed for zero-cost usage
- **Auto-selection** - Automatically picks best available free model (Gemini, Llama, etc.)
- **Good enough quality** - Works well for personal analytics
- **Rate-limited** - 50 requests per day (perfect for daily Nomie insights)
- **To get 1000 req/day** - Purchase $10+ in credits on OpenRouter (unlocks higher tier)

The key difference:
- Add payment method → Get access to free tier (50 req/day)
- Purchase $10+ credits → Unlock higher limit (1000 req/day)

### Free vs Paid Trade-offs

| Aspect | Free Models | Paid (Claude/GPT-4) |
|--------|-------------|-------------------|
| **Cost** | $0 | $0.001-0.01+ per request |
| **Quality** | Good | Excellent |
| **Speed** | Good | Very fast |
| **Requests/min** | ~20 (fair-use) | Higher with paid plans |
| **Best for** | Typical insights, chat | Complex analysis, high volume |

### When to Upgrade

Consider switching to paid models if:
- You hit the 20 requests/minute limit frequently
- You need higher quality responses
- You want faster processing
- You're using Nomie heavily throughout the day

To upgrade: Go to Settings → AI Integration → select Claude instead of OpenRouter

### Free Tier Setup (50 requests/day)

To use OpenRouter's free tier:

1. Create account at [openrouter.ai](https://openrouter.ai)
2. Go to **Account → Credits** and add a payment method
   - This unlocks access to the free tier (50 req/day)
   - You won't be charged for free models
3. Get your API key from **Account → API Keys**
4. Add to Nomie: Settings → AI Integration → OpenRouter
5. Start using (50 requests per day limit)

### Unlocking Higher Limit (1000 requests/day)

If you need more than 50 requests/day:

1. Go to [openrouter.ai/settings/credits](https://openrouter.ai/settings/credits)
2. Purchase **$10 or more** in credits
   - This upgrades you to 1000 requests/day
   - Free models still won't charge (credits used only if you switch to paid models)
3. Your limit updates immediately
4. Nomie continues to use free models with new limit

**If you see "Insufficient credits" error:**
- You're on the free tier (50 req/day) - this means it's working!
- If you need more requests, purchase $10+ to unlock 1000 req/day
- Check that your API key is for the correct OpenRouter account

---

## Advanced Configuration

### Environment Variables (Development)

If developing Nomie locally, you can set environment variables:

```bash
# .env.local
VITE_OPENROUTER_API_KEY=sk-or-...
VITE_OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

### Checking Your Usage

1. Log in to [openrouter.ai](https://openrouter.ai)
2. Click **Account** → **Usage**
3. View:
   - Tokens used
   - Requests made
   - Cost breakdown by model
   - Daily/monthly limits

### Monitoring API Health

If Nomie's AI features aren't working:

1. **Check OpenRouter status**: [status.openrouter.ai](https://status.openrouter.ai)
2. **Verify your API key**:
   - Go to Settings → AI Integration
   - Ensure API key is still there (encrypted)
   - Try re-entering the key if issues persist
3. **Check account credits**:
   - Log in to openrouter.ai
   - Ensure you have available balance
   - Add payment method if needed
4. **Review error messages**:
   - Check browser console (F12) for specific errors
   - Common issues: invalid key, insufficient credits, rate limited

---

## Troubleshooting

### "API key is not configured"
- **Solution**: Go to Settings → AI Integration → add your API key and click Save

### "Failed to decrypt API key"
- **Cause**: You have a PIN set but Nomie can't decrypt the key
- **Solution**: 
  - Go to Settings → Security → change your PIN
  - Then go to AI Integration and re-enter your API key
  - Save again

### "OpenRouter API error"
- **Cause**: Invalid API key or account issue
- **Solution**:
  - Verify key at [openrouter.ai](https://openrouter.ai) → API Keys
  - Ensure you have available credits
  - Check OpenRouter status page for service issues

### Insight Widget Not Showing
- Ensure AI is enabled in Settings → AI Integration
- Check that OpenRouter is selected
- Verify API key is entered and PIN is set (if applicable)
- Wait for widget to load (caches for 24 hours)

### Chat Slow or Timing Out
- OpenRouter may be slow with certain models
- Try reducing the timeframe (less data = faster response)
- Check OpenRouter dashboard for rate limits
- Consider switching to GPT-3.5 Turbo for better speed

### High Unexpected Costs
- Review usage in OpenRouter dashboard
- Check which model is being used
- Consider using GPT-3.5 Turbo (cheaper)
- Set context limits to reduce token usage

---

## Switching Between Claude and OpenRouter

Nomie makes it easy to switch providers:

1. Go to **Settings → AI Integration**
2. Click the service selector (Claude / OpenRouter)
3. Choose your preferred provider
4. Ensure API key is entered for that provider
5. Click **Save Configuration**

**Note**: You must have API keys for any provider you want to use. Both can be configured simultaneously.

---

## Security Best Practices

1. **Always use a PIN**
   - Set PIN in Settings → Security → Use PIN
   - This encrypts your API key at rest
   - Required for decryption when AI features are used

2. **Regenerate your key if exposed**
   - Go to openrouter.ai → API Keys
   - Delete the old key
   - Create a new one
   - Update it in Nomie

3. **Monitor your account**
   - Check OpenRouter usage regularly
   - Set up alerts for unusual activity
   - Review connected applications

4. **Never share your key**
   - Don't paste it in public forums
   - Don't commit to version control
   - Don't share screenshots showing the key

---

## FAQ

### Nomie uses free models - what does that mean?
Nomie is configured to use OpenRouter's `openrouter/auto` which automatically selects from free, open-source models (Llama, Mistral, etc.). You get unlimited API calls with no cost, subject to rate limits (~20 requests/min).

### What are the limitations of free models?
- ⚠️ Rate limits: ~20 requests/minute (fair-use)
- ⚠️ Quality: Good but not as advanced as Claude/GPT-4
- ⚠️ Speed: Good but slightly slower than premium models
- ✅ Cost: $0

### Can I switch to paid models?
Yes! Go to Settings → AI Integration:
1. Switch from OpenRouter to Claude (requires Claude API key)
2. Or stay on OpenRouter but edit code to use `openai/gpt-3.5-turbo` or other paid models
3. Or keep OpenRouter free but use a specific free model

See "Changing Models (Advanced)" in the setup guide for details.

### What if I hit the rate limit?
You'll get an error message like "Rate limited". Wait a minute and try again. The limit resets regularly.

If you frequently hit limits, consider:
- Reducing AI feature usage slightly
- Switching to paid Claude option
- Batching requests when possible

### Can I use both Claude and OpenRouter?
Yes! You can configure API keys for both. Switch between them anytime in Settings → AI Integration.

### Can I change which free model OpenRouter uses?
OpenRouter's `openrouter/auto` automatically selects the best available free model. You don't choose which one - it's automatic.

If you want a specific model, edit `src/domains/ai/services/openrouter.ts` and change the `model` parameter to one from [openrouter.ai/models](https://openrouter.ai/models).

### Do I need to pay for an OpenRouter account?
No! You can create a free account and use free models indefinitely. No payment method required.

### Is my data shared with OpenRouter?
- Your API key: Only for authentication
- Your prompts and data: Sent to OpenRouter's servers to generate responses
- OpenRouter's privacy policy applies to data processing
- See [openrouter.ai/privacy](https://openrouter.ai/privacy) for details

### What happens to my insights if I switch providers?
Your existing cached insights are stored locally and won't be affected. New insights will be generated by whichever provider you have configured.

---

## Getting Help

### Nomie Support
- Check this guide first
- Review browser console (F12) for errors
- Check git issues or discussions

### OpenRouter Support
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Status Page](https://status.openrouter.ai)
- [OpenRouter Support Email](https://openrouter.ai)

### Report Issues
If you find a bug with OpenRouter integration in Nomie:
1. Include your error message
2. Include steps to reproduce
3. Include OpenRouter error response (if any)
4. Do NOT include your actual API key

---

## Next Steps

1. ✅ Create OpenRouter account and API key
2. ✅ Add API key to Nomie
3. ✅ Set a PIN to encrypt your key
4. ✅ Try Insight Widget on a tracker
5. ✅ Try AI Chat feature
6. ✅ Monitor costs in OpenRouter dashboard

Enjoy AI-powered insights in Nomie! 🚀
